import os
import shutil
import stat
from pathlib import Path
from langchain_community.document_loaders import GitLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language
import time


EXTENSION_MAP = {
    ".py": Language.PYTHON, ".js": Language.JS, ".ts": Language.TS,
    ".java": Language.JAVA, ".cpp": Language.CPP, ".go": Language.GO,
    ".md": Language.MARKDOWN,
}

def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)

def clean_dir(path):
    if os.path.exists(path):
        for attempt in range(3):
            try:
                shutil.rmtree(path, onerror=remove_readonly)
                break
            except OSError:
                time.sleep(0.5)

def process_repo_optimal(repo_url,unique_repo_id, branch="main"):
    
    print(f"🆔 Processing Unique ID: {unique_repo_id}")

    base_dir = os.getcwd()
    safe_dir_name = unique_repo_id.replace("/", "_") 
    local_path = os.path.join(base_dir, "temp_repos", safe_dir_name)

    clean_dir(local_path)
    
    try:
        try:
            loader = GitLoader(
                clone_url=repo_url,
                repo_path=local_path,
                branch=branch,
                file_filter=lambda x: Path(x).suffix in EXTENSION_MAP
            )
            raw_documents = loader.load()
        except Exception as git_err:
            if branch == "main" and "pathspec 'main' did not match" in str(git_err):
                print("Branch 'main' not found, retrying with 'master'...")
                clean_dir(local_path)
                loader = GitLoader(
                    clone_url=repo_url,
                    repo_path=local_path,
                    branch="master",
                    file_filter=lambda x: Path(x).suffix in EXTENSION_MAP
                )
                raw_documents = loader.load()
            else:
                raise git_err
            
        # 2. Add Tags
        for doc in raw_documents:
            doc.metadata["repo_id"] = unique_repo_id 
            doc.metadata["file_name"] = Path(doc.metadata["file_path"]).name

        # 3. Chunking
        final_chunks = []
        for doc in raw_documents:
            file_ext = Path(doc.metadata['file_path']).suffix
            lang = EXTENSION_MAP.get(file_ext, Language.MARKDOWN)
            
            splitter = RecursiveCharacterTextSplitter.from_language(
                language=lang,
                chunk_size=1000,
                chunk_overlap=150
            )
            final_chunks.extend(splitter.split_documents([doc]))
            
        print("chunks created")
        return final_chunks

    except Exception as e:
        print(f"Error processing repo: {e}")
        return []
    finally:
        clean_dir(local_path)
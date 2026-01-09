import chromadb
import numpy as np
import umap
import plotly.express as px
import pandas as pd

client = chromadb.PersistentClient(path="./chroma")
collection = client.get_collection("messages")

data = collection.get(include=["embeddings", "metadatas", "documents"])
embeddings = np.array(data["embeddings"])
metadatas = data["metadatas"]

reducer = umap.UMAP(
    n_components=3,
    n_neighbors=15,
    min_dist=0.1,
    metric="cosine",
    random_state=42
)

reduced = reducer.fit_transform(embeddings)

df = pd.DataFrame({
    "x": reduced[:,0],
    "y": reduced[:,1],
    "z": reduced[:,2],
    #"prompt": [m.get("prompt") for m in metadatas],
    #"response": [m.get("response") for m in metadatas]
})

fig = px.scatter_3d(
    df,
    x="x",
    y="y",
    z="z",
    title="3D ChromaDB Vector Space"
)


print("Embeddings:", embeddings.shape)
print("Reduced:", reduced.shape)
print("About to show figure")
fig.show()

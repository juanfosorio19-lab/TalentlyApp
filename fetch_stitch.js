const fs = require('fs');

async function download() {
    const url1 = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc5MjRmMjU5ZGNhYjQ1ZmFiZDBlNGViYjY1OWI0MzA4EgsSBxCEqYbKngEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTMxODMwNjYxODUwMjY4MjgyNw&filename=&opi=89354086";
    const url2 = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAxNDU5NzUwNGUwMzQ0MjlhOWI5MDFhY2FkYTczODMxEgsSBxCEqYbKngEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTMxODMwNjYxODUwMjY4MjgyNw&filename=&opi=89354086";
    
    const res1 = await fetch(url1);
    const text1 = await res1.text();
    fs.writeFileSync('stitch_swipe.html', text1);
    
    const res2 = await fetch(url2);
    const text2 = await res2.text();
    fs.writeFileSync('stitch_overlay.html', text2);
    
    console.log("Downloaded screens");
}

download();

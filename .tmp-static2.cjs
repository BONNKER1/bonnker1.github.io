const http=require("http"),fs=require("fs"),p=require("path");
const root=process.cwd();
const types={".svg":"image/svg+xml",".html":"text/html"};
http.createServer((q,s)=>{
  const f=p.join(root,decodeURIComponent(q.url.split("?")[0]));
  fs.readFile(f,(e,d)=>{ if(e){s.writeHead(404);s.end("nf");return;}
    s.writeHead(200,{"Content-Type":types[p.extname(f)]||"application/octet-stream"});s.end(d);});
}).listen(8098,()=>console.log("up"));

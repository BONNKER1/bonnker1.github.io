const http=require('http'),fs=require('fs'),p=require('path');
const root=p.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.glb':'model/gltf-binary'};
http.createServer((q,s)=>{
  let u=decodeURIComponent(q.url.split('?')[0]);
  if(u.endsWith('/')) u+='index.html';
  const f=p.join(root,u);
  if(!f.startsWith(root)){s.writeHead(403);s.end('forbidden');return;}
  fs.readFile(f,(e,d)=>{ if(e){s.writeHead(404);s.end('nf: '+u);return;}
    s.writeHead(200,{'Content-Type':types[p.extname(f)]||'application/octet-stream'});s.end(d);});
}).listen(4399,()=>console.log('up 4399'));

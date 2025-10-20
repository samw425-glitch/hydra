async function fetchJson(url){
  try{const res=await fetch(url); if(!res.ok) throw new Error(res.status); return await res.json();}
  catch(e){console.error(e); return [];}
}
async function loadTopics(){
  const topics = await fetchJson("http://localhost:41000/topics");
  const container = document.getElementById("topics-container");
  container.innerHTML="";
  topics.forEach(async t=>{
    const div=document.createElement("div");
    div.className="topic";
    div.innerHTML=`<h3>${t.topic}</h3><p id="content-${t.topic}">Loading...</p>`;
    container.appendChild(div);
    const content = await fetchJson(`http://localhost:41001/generated?topic=${encodeURIComponent(t.topic)}`);
    document.getElementById(`content-${t.topic}`).innerText = content.content;
  });
}
setInterval(loadTopics,30000);
window.onload = loadTopics;

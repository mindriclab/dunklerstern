/* Unterstützen: Krypto-Adresse in die Zwischenablage kopieren. Die Adresse steht zusätzlich sichtbar daneben. */
(function(){
document.querySelectorAll('.copy[data-address]').forEach(b=>b.addEventListener('click',async()=>{
  try{
    await navigator.clipboard.writeText(b.dataset.address);
    const t=b.textContent;b.textContent='Kopiert';setTimeout(()=>{b.textContent=t;},1500);
  }catch(e){/* Zwischenablage nicht verfügbar */}
}));
})();

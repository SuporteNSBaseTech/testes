verificaAutenticado()

document.getElementById("ch-side").addEventListener("change", event => {
  const mainSide = document.getElementById("main-side")
  if (event.target.checked) {
    mainSide.classList.remove("off")
  }
  else {
    mainSide.classList.add("off")
  }
})



Nome = '';
Usuario = ''


  ; (async () => {
    const token = localStorage.getItem(CHAVE)

    const response = await fetch('/verify', {
      body: JSON.stringify({ token }),
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      }
    })


    const data = await response.json()
    Nome = data.Nome;
    Usuario = data.Usuario;

    const userGreeting = document.getElementById('userGreeting');
    userGreeting.textContent = `Olá, ${Nome}!`;

   })().catch(console.error)

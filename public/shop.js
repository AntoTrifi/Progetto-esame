document.addEventListener('DOMContentLoaded', async () => {
    const buyTickets = document.getElementById("buy-tickets")
    const yourTickets = document.getElementById("your-tickets")
    const ticketsForms = document.getElementById("tickets-forms")
    const inventoryTickets = document.getElementById("inventory-tickets")

    ticketsForms.style.display = 'flex'
    inventoryTickets.style.display = 'none'
    let flag = 0;
    buyTickets.addEventListener('click', e => {
        ticketsForms.style.display = 'flex'
        inventoryTickets.style.display = 'none'
        flag = 0;
        location.reload();
    });


    document.getElementById('buy-normal-ticket-form').addEventListener('submit', async (event) => {
        let tipo_biglietto = 'intero'
        const response1 = await fetch('/auth/status');
        const data = await response1.json();
        if(data.authenticated)
        {
           const response = await fetch('/buyticket', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({tipo_biglietto})
           });

           if (!response.ok) 
           {
              throw new Error('buy failed');
           }
        }
        else
        {
            alert("Devi eseguire l'accesso")
        }
        
    });
    document.getElementById('buy-reduced-ticket-form').addEventListener('submit', async (event) => {
        let tipo_biglietto = 'ridotto'
        const response1 = await fetch('/auth/status');
        const data = await response1.json();
        if(data.authenticated)
        {
           const response = await fetch('/buyticket', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({tipo_biglietto})
           });

           if (!response.ok) 
           {
              throw new Error('buy failed');
           }
        }
        else
        {
            alert("Devi eseguire l'accesso")
        }
    });

    
    yourTickets.addEventListener('click', async (event) => {
        if(flag == 0)
        {
            flag = 1;
            ticketsForms.style.display = 'none'
            inventoryTickets.style.display = 'inline'
            
            const response1 = await fetch('/auth/status');
            const data = await response1.json();
            if(data.authenticated)
            {
                
                const response = await fetch('/yourticket',);
                const data = await response.json()
                let ticket = data.tickets
                ticket.forEach(async t => {
                    let pId = document.createElement("p");
                    let id = document.createTextNode("Id: ");
                    let pData = document.createElement("p");
                    let data = document.createTextNode("Data d'acquisto: ");
                    let pTipo = document.createElement("p");
                    let tipo = document.createTextNode("Tipo biglietto: ");
                    let qrCode = document.createElement("div");
                    qrCode.setAttribute("id", `qr-code${t.id_ticket}`);
                    pId.appendChild(id)
                    pId.innerText += t.id_ticket
                    pData.appendChild(data);
                    pData.innerText += t.data_acquisto
                    pTipo.appendChild(tipo);
                    pTipo.innerText += t.tipo_biglietto


                    let ticketCard = document.createElement("span");
                    ticketCard.appendChild(qrCode);
                    ticketCard.appendChild(pId);
                    ticketCard.appendChild(pData);
                    ticketCard.appendChild(pTipo);
                    
                    
                    let invTick = document.getElementById("inventory-tickets")
                    invTick.appendChild(ticketCard)

                    //GENERAZIONE CODICE QR
                    let number = t.id_ticket

                    let response2 = await fetch('/generate-qr', {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ number })
                    });
                
                    if (!response2.ok) {
                        throw new Error('Failed to generate QR code');
                    }
                
                    let data1 = await response2.json();
                    let qrCodeDiv = document.getElementById(`qr-code${t.id_ticket}`);
                    qrCodeDiv.innerHTML = `<img src="${data1.qrCodeUrl}" alt="QR Code">`;

                });
                
                if (!response.ok) 
                {
                    throw new Error('buy failed');
                }
            }
            else
            {
                alert("Devi eseguire l'accesso")
            }
        }
    });
});
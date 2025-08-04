verificaAutenticado()

const modAgen = document.getElementById('mod-agen')
const modEspera = document.getElementById('mod-espera')
const modCancelado = document.getElementById('mod-cancelado')


let todosPacientes = []

const isLeapYear = (year) => {
    return (
        (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) ||
        (year % 100 === 0 && year % 400 === 0)
    );
};

const getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28;
};


const anoPassado = new Date().getFullYear() - 1;
const valorQuinzenal = (anoPassado % 4 === 0 && (anoPassado % 100 !== 0 || anoPassado % 400 === 0)) ? 14 : 15;

let calendar = document.querySelector('.calendar');
const month_names = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];
let month_picker = document.querySelector('#month-picker');
const dayTextFormate = document.querySelector('.day-text-formate');
const timeFormate = document.querySelector('.time-formate');
const dateFormate = document.querySelector('.date-formate');

month_picker.onclick = () => {
    month_list.classList.remove('hideonce');
    month_list.classList.remove('hide');
    month_list.classList.add('show');
    dayTextFormate.classList.remove('showtime');
    dayTextFormate.classList.add('hidetime');
    timeFormate.classList.remove('showtime');
    timeFormate.classList.add('hideTime');
    dateFormate.classList.remove('showtime');
    dateFormate.classList.add('hideTime');
};

let newCurrentDay = new Date()
let currentDayLista;

const horas = [
    6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
]

function generateNewList() {
    document.getElementById("olcards").innerHTML = horas.reduce((acc, hora) => acc + `
    <li data-message="${String(hora).padStart(2, '0')}:00" style="--cardColor:rgb(18, 211, 195)">
      <div class="content" id="status-${String(hora).padStart(2, '0')}:00">
          <div class="text" id="agendamento-${String(hora).padStart(2, '0')}:00">
            
          </div>
      </div>
    </li>

    ${buildMinutes(hora)}
  `, '')
}

function buildMinutes(hora) {
    var minutosMontados = ''

    for (let minute = 10; minute < 60; minute += 10) {
        minutosMontados += `
        <li data-message="${String(hora).padStart(2, '0')}:${String(minute).padStart(2, '0')}" style="--cardColor:rgb(18, 211, 195)">
          <div class="content" id="status-${String(hora).padStart(2, '0')}:${String(minute).padStart(2, '0')}">
              <div class="text" id="agendamento-${String(hora).padStart(2, '0')}:${String(minute).padStart(2, '0')}">
                
              </div>
          </div>
        </li>
      `
    }
    return minutosMontados;
}



async function carregarLista(force) {
    if (newCurrentDay === currentDayLista && force === undefined) return
    currentDayLista = newCurrentDay

    generateNewList()

    const cD = (currentDayLista.getDate()).toString().padStart(2, '0')
    const cM = (currentDayLista.getMonth() + 1).toString().padStart(2, '0')
    const cY = currentDayLista.getFullYear().toString().padStart(2, '0')

    const response = await fetch('/agendamentos')
    let data = await response.json()

    window.todosAgendamentos = [...data]; // salva todos antes de filtrar

    data = data.filter(arg =>
        arg.Data_do_Atendimento === `${cY}-${cM}-${cD}` &&
        arg.Especialista.toLowerCase().includes(document.getElementById("lista").value.toLowerCase())

    )

    window.agendamentosAlunos = data.filter(a => a.Eh_Aluno === true);

    data = data.filter(a => a.Eh_Aluno !== true);

    data.forEach(arg => {
        const contentId = `agendamento-${arg.Horario_da_consulta}`;

        const contentEl = document.getElementById(contentId);


        if (contentEl) {

            contentEl.style = 'cursor: pointer; user-select: none; position: relative;';

            // Conteúdo da faixa com o botão na ponta
            contentEl.innerHTML = `
  <span style="display: inline-block; padding-right: 40px;">
    ${todosPacientes.find(pac => arg.Nome === pac.id)?.Nome} - Especialista: ${consultores.find(arg => arg.Usuario === list.value).Nome} - Observação: ${arg.observacao}
  </span>

<button type="button" 
 onclick="event.stopPropagation()"
  onmouseenter="event.stopPropagation(); abrirPopupListaAlunos('${arg.Horario_da_consulta}', '${consultores.find(c => c.Usuario === arg.Especialista)?.Nome || arg.Especialista}', event)" 
  onmouseleave="fecharPopupComDelay()"   
  class="open-lista_alunos" 
  id="alunos-${arg.id}">
<i class="bi bi-person-lines-fill"></i>
   
  </button>
`;
            contentEl.style = 'cursor: pointer; user-select: none;'

            const lis = document.querySelectorAll("#olcards li");
            const startIndex = getIndexByDataMessage(`${arg.Horario_da_consulta}`);
            const endIndex = getIndexByDataMessage(`${arg.Horario_de_Termino_da_consulta}`);

            for (let i = startIndex; i <= endIndex && i < lis.length; i++) {
                let element = lis[i].firstElementChild;
                element.style = 'background-color: rgb(205, 205, 205);';

                // Adicionando mensagem de Horários Agendados apenas nos elementos cinza, exceto o horário de início
                if (i !== startIndex) {
                    const atendimentoMessage = document.createElement('div');
                    atendimentoMessage.innerText = 'Horário Ocupado';
                    atendimentoMessage.style = 'font-weight: bold; text-align: right;';
                    element.appendChild(atendimentoMessage);
                }

                // Adicionar borda ao elemento li

            }

            contentEl.onclick = () => {
                pacientesFiltrados = todosPacientes.filter(({ Especialista }) => Especialista === list.value)

                nameinp.innerHTML = ''
                pacientesFiltrados.forEach(item => {
                    nameinp.innerHTML += `<option value="${item.id}">${item.Nome}</option>`
                })

                age_name.disabled = true
                document.getElementById("btn-start-atendimento").style = "display:auto"


                modAgen.showModal()

                nameinp.value = arg.Nome
                phoneinp.value = arg.Telefone
                list.value = arg.Especialista
                data_atendimentoinp.value = arg.Data_do_Atendimento
                horario_consultainp.value = arg.Horario_da_consulta
                horariot_consultainp.value = arg.Horario_de_Termino_da_consulta
                valor_consultainpinp.value = arg.Valor_da_Consulta
                status_consultainp.value = arg.Status_da_Consulta
                status_pagamentoinp.value = arg.Status_do_pagamento
                observacaoinp.value = arg.observacao
                id_agendamento.value = arg.id
                document.getElementById("eh_aluno").checked = arg.Eh_Aluno === true;
                document.getElementById("formagendamento").dataset.agendamentoid = arg.id
            }

        }

        const statusId = `status-${arg.Horario_da_consulta}`;
        const statusEl = document.getElementById(statusId);

        if (statusEl) {
            var statusFormated = arg.Status_da_Consulta.toLowerCase().replace(' ', '-')
            if (statusFormated.match("ã")) {
                statusFormated = statusFormated.replace("ã", "a");
            }
            if (statusFormated.match("ç")) {
                statusFormated = statusFormated.replace("ç", "c");
            }
            statusEl.classList.add(`status-${statusFormated}`);
        }
    })



}

function abrirPopupListaAlunos(horarioConsulta, especialista, event) {
    const popup = document.getElementById('popup-lista-alunos');
    const lista = document.getElementById('lista-alunos-popup');
    const titulo = document.getElementById('titulo-especialista');

    // limpa conteúdo anterior
    lista.innerHTML = '';
    titulo.innerText = `Especialista: ${list.value}`;

    // filtrar alunos do mesmo horário
    // Pega o agendamento principal baseado no horário e especialista
    const agendamentoPrincipal = (window.todosAgendamentos || []).find(p =>
        p.Horario_da_consulta === horarioConsulta &&
        p.Especialista === list.value &&
        !p.Eh_Aluno
    );


    // Caso não encontre, filtra por horário exato (modo antigo)
    const alunosMesmoHorario = agendamentoPrincipal
        ? filtrarAlunosNoIntervalo(
            agendamentoPrincipal.Horario_da_consulta,
            agendamentoPrincipal.Horario_de_Termino_da_consulta,
            especialista
        )
        : (window.agendamentosAlunos || []).filter(p =>
            p.Horario_da_consulta === horarioConsulta &&
            p.Especialista === list.value &&
            p.Eh_Aluno === true
        );



    if (alunosMesmoHorario.length === 0) {
        lista.innerHTML = '<li style="color: gray;">Nenhum aluno agendado nesse horário.</li>';
    } else {
        alunosMesmoHorario.forEach(p => {
            if (!p.Eh_Aluno) return;  // pula se não for aluno 
            const paciente = todosPacientes.find(tp => tp.id === p.Nome);
            const nomeAluno = paciente ? paciente.Nome : p.Nome || "Aluno não encontrado";

            const statusClass = {
                "Cancelado": "status-cancelado",
                "Aguardando Confirmação": "status-aguardando-confirmacao",
                "Confirmado": "status-confirmado",
                "Compareceu": "status-compareceu"
            }[p.Status_da_Consulta] || "";

            lista.innerHTML += `
 <li style="display: flex; align-items: center;">
  <span style="flex-grow: 1; text-align: left;">
    <span class="bolinha-status ${statusClass}" style="width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px;"></span>
    ${nomeAluno}</span>
  <button type="button"  onclick='abrirEdicaoAluno(${JSON.stringify(p)})' style="margin-left: 10px;" title="Editar agendamento">
    <i class="bi bi-pencil"></i>
  </button>
  <br>
</li>`;


        });
    }

    // posicionar popup perto do botão clicado
    popup.style.left = `${event.clientX - 250}px`;
    popup.style.top = `${event.clientY + 10}px`;
    popup.style.display = 'block';

}

function filtrarAlunosNoIntervalo(horarioInicioPrincipal, horarioFimPrincipal, especialista) {
    const alunos = window.agendamentosAlunos || [];

    return alunos.filter(p => {
        if (!p.Eh_Aluno || p.Especialista !== list.value) return false;

        // Ignora se os horários não sobrepõem
        return !(p.Horario_da_consulta >= horarioFimPrincipal ||
            p.Horario_de_Termino_da_consulta <= horarioInicioPrincipal);
    });
}


function abrirEdicaoAluno(agendamento) {
    pacientesFiltrados = todosPacientes.filter(({ Especialista }) => Especialista === list.value);

    nameinp.innerHTML = '';
    pacientesFiltrados.forEach(item => {
        nameinp.innerHTML += `<option value="${item.id}">${item.Nome}</option>`;
    });

    age_name.disabled = true;
    document.getElementById("btn-start-atendimento").style = "display:auto";

    modAgen.showModal();

    nameinp.value = agendamento.Nome;
    phoneinp.value = agendamento.Telefone;
    list.value = agendamento.Especialista;
    data_atendimentoinp.value = agendamento.Data_do_Atendimento;
    horario_consultainp.value = agendamento.Horario_da_consulta;
    horariot_consultainp.value = agendamento.Horario_de_Termino_da_consulta;
    valor_consultainpinp.value = agendamento.Valor_da_Consulta;
    status_consultainp.value = agendamento.Status_da_Consulta;
    status_pagamentoinp.value = agendamento.Status_do_pagamento;
    observacaoinp.value = agendamento.observacao;
    document.getElementById("eh_aluno").checked = agendamento.Eh_Aluno === true;
    id_agendamento.value = agendamento.id;
    document.getElementById("formagendamento").dataset.agendamentoid = agendamento.id;
}


function fecharPopupComDelay() {
    const popup = document.getElementById('popup-lista-alunos');
    popup.closeTimeout = setTimeout(() => {
        popup.style.display = 'none';
    }, 300);
}

document.getElementById('popup-lista-alunos').addEventListener('mouseenter', () => {
    clearTimeout(document.getElementById('popup-lista-alunos').closeTimeout);
});

document.getElementById('popup-lista-alunos').addEventListener('mouseleave', () => {
    document.getElementById('popup-lista-alunos').style.display = 'none';
});


function getIndexByDataMessage(dataMessage) {
    const element = document.querySelector(`[data-message="${dataMessage}"]`);
    const lis = document.querySelectorAll("#olcards li");
    return Array.prototype.indexOf.call(lis, element);
}


const generateCalendar = async (month, year) => {
    let calendar_days = document.querySelector('.calendar-days');
    calendar_days.innerHTML = '';
    let calendar_header_year = document.querySelector('#year');
    let days_of_month = [
        31,
        getFebDays(year),
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];

    const currentDate = newCurrentDay;

    carregarLista()

    month_picker.innerHTML = month_names[month];

    calendar_header_year.innerHTML = year;

    let first_day = new Date(year, month);


    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {

        let day = document.createElement('div');

        if (i >= first_day.getDay()) {
            const nDay = i - first_day.getDay() + 1;

            day.innerHTML = nDay

            day.onclick = (() => {
                console.log(nDay)
                const calendarCurrentDate = new Date(`${year}-${month + 1}-${nDay}`)
                calendarCurrentDate.setHours(calendarCurrentDate.getHours() + 3)
                newCurrentDay = calendarCurrentDate;
                generateCalendar(month, year)
            })

            if (i - first_day.getDay() + 1 === currentDate.getDate() &&
                year === currentDate.getFullYear() &&
                month === currentDate.getMonth()
            ) {
                day.classList.add('current-date');
            }
        }
        calendar_days.appendChild(day);
    }
};

let month_list = calendar.querySelector('.month-list');
month_names.forEach((e, index) => {
    let month = document.createElement('div');
    month.innerHTML = `<div>${e}</div>`;

    month_list.append(month);
    month.onclick = () => {
        currentMonth.value = index;
        generateCalendar(currentMonth.value, currentYear.value);
        month_list.classList.replace('show', 'hide');
        dayTextFormate.classList.remove('hideTime');
        dayTextFormate.classList.add('showtime');
        timeFormate.classList.remove('hideTime');
        timeFormate.classList.add('showtime');
        dateFormate.classList.remove('hideTime');
        dateFormate.classList.add('showtime');
    };
});

(function () {
    month_list.classList.add('hideonce');
})();
document.querySelector('#pre-year').onclick = () => {
    --currentYear.value;
    generateCalendar(currentMonth.value, currentYear.value);
};
document.querySelector('#next-year').onclick = () => {
    ++currentYear.value;
    generateCalendar(currentMonth.value, currentYear.value);
};

let currentDate = new Date();
let currentMonth = { value: currentDate.getMonth() };
let currentYear = { value: currentDate.getFullYear() };
generateCalendar(currentMonth.value, currentYear.value);

const todayShowTime = document.querySelector('.time-formate');
const todayShowDate = document.querySelector('.date-formate');

const currshowDate = new Date();
const showCurrentDateOption = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
};
const currentDateFormate = new Intl.DateTimeFormat(
    'pt-BR',
    showCurrentDateOption
).format(currshowDate);
todayShowDate.textContent = currentDateFormate;
setInterval(() => {
    const timer = new Date();
    const option = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    };
    const formateTimer = new Intl.DateTimeFormat('pt-br', option).format(timer);
    let time = `${`${timer.getHours()}`.padStart(
        2,
        '0'
    )}:${`${timer.getMinutes()}`.padStart(
        2,
        '0'
    )}: ${`${timer.getSeconds()}`.padStart(2, '0')}`;
    todayShowTime.textContent = formateTimer;
}, 1000);


const list = document.getElementById("lista")
// const list2 = document.getElementById("esp-especialista")
let consultores = []

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

        // data = USUARIO DO BANCO LOGADO

        // -----------------------------------

        const response2 = await fetch('/users')
        consultores = await response2.json()

        if (data.Secretaria) {
            consultores.filter(arq => !arq.Secretaria && arq.Nome !== "ADM").forEach(({ Usuario, Nome }) => {
                list.innerHTML += `<option value="${Usuario}">${Nome}</option>`
                // list2.innerHTML += `<option value="${Usuario}">${Nome}</option>`
            })
        } else {
            [data].forEach(({ Usuario, Nome }) => {
                list.innerHTML += `<option value="${Usuario}">${Nome}</option>`
                // list2.innerHTML += `<option value="${Usuario}">${Nome}</option>`
            })
        }
    })().catch(console.error)

list.onchange = async function (e) {
    await carregarLista(true)

    document.getElementById('selectedName').innerHTML = `AGENDA DR(a) - ${consultores.find(arg => arg.Usuario === list.value).Nome}`
}

const espec = document.getElementById("especialista");


const statusp = document.getElementById("status_pagamento");

const tipoDoStatus1 = "(nenhum)"
const tipoDoStatus2 = "Pago"
const tipoDoStatus3 = "Pendente"
const tipoDoStatus4 = "Cancelado"

statusp.innerHTML += `<option>${tipoDoStatus1}</option>`;
statusp.innerHTML += `<option>${tipoDoStatus2}</option>`;
statusp.innerHTML += `<option>${tipoDoStatus3}</option>`;
statusp.innerHTML += `<option>${tipoDoStatus4}</option>`;

const statusc = document.getElementById("status_c");

const tipoDoStatusc1 = "(nenhum)"
const tipoDoStatusc2 = "Confirmado"
const tipoDoStatusc3 = "Aguardando Confirmação"
const tipoDoStatusc4 = "Cancelado"
const tipoDoStatusc5 = "Compareceu"

statusc.innerHTML += `<option>${tipoDoStatusc1}</option>`;
statusc.innerHTML += `<option>${tipoDoStatusc2}</option>`;
statusc.innerHTML += `<option>${tipoDoStatusc3}</option>`;
statusc.innerHTML += `<option>${tipoDoStatusc4}</option>`;
statusc.innerHTML += `<option>${tipoDoStatusc5}</option>`;

; (async () => {
    const response = await fetch('/pacientes')
    todosPacientes = await response.json()
})()

let pacientesFiltrados = []


document.getElementById('agendamento').addEventListener('click', () => {
    if (list.value === "-") {
        alert("Selecione o Especialista")
        return
    }

    pacientesFiltrados = todosPacientes.filter(({ Especialista }) => Especialista === list.value)
    age_name.disabled = false
    document.getElementById("btn-start-atendimento").style = "display:none"

    nameinp.innerHTML = ''
    pacientesFiltrados.forEach(item => {
        nameinp.innerHTML += `<option value="${item.id}">${item.Nome}</option>`
    })

    document.getElementById("formagendamento").dataset.agendamentoid = "0";
    nameinp.value = "" // A escrita antes do : tem que ta igual ao campo que foi criado no prisma
    phoneinp.value = ""
    data_atendimentoinp.value = ""
    horario_consultainp.value = ""
    horariot_consultainp.value = ""
    valor_consultainpinp.value = ""
    status_consultainp.value = ""
    status_pagamentoinp.value = ""
    observacaoinp.value = ""
    id_agendamento.value = ""
    document.getElementById("eh_aluno").checked = false;
    const mostrarSubformCheckbox = document.getElementById('mostrarSubform');
    const subform = document.getElementById('subform');

    mostrarSubformCheckbox.checked = false;   // checkbox desmarcado
    subform.style.display = 'none';
    modAgen.showModal()
});

document.getElementById('btn-close').addEventListener('click', () => {

    modAgen.close()
})

document.getElementById("btn_voltar_a").addEventListener("click", () => {
    window.location.href = '../Menu/menu.html'
})


const nameinp = document.getElementById("age_name") //O getElementById tem que ser igual o id
const phoneinp = document.getElementById("phone")
const data_atendimentoinp = document.getElementById("data_atendimento")
const horario_consultainp = document.getElementById("horario_consulta")
const horariot_consultainp = document.getElementById("horariot_consulta")
const valor_consultainpinp = document.getElementById("valor_consulta")
const status_consultainp = document.getElementById("status_c")
const status_pagamentoinp = document.getElementById("status_pagamento")
const observacaoinp = document.getElementById("observacao")
const id_agendamento = document.getElementById("id_agendamento")
const ehAluno = document.getElementById("eh_aluno").checked

function atualizaTelefone() {
    const paciente = pacientesFiltrados.find(paciente => paciente.id === nameinp.value)
    phoneinp.value = paciente.Telefone
}


function calculadata() {

    var repeticoes = parseInt(document.getElementById("repeticoes").value);
    var tipo = document.getElementById("periodo").value;
    var periodo = 0;
    var dataBrasileira = document.getElementById("data_atendimento").value;


    switch (tipo) {
        case "semanal":
            periodo = 7;
            break;
        case "quinzenal":
            periodo = valorQuinzenal;
            break;
        case "mensal":
            periodo = 30;
            break;
        case "anual":
            periodo = 365;
            break;
        default:
            periodo = 0;
            break;
    }
    var texto = "";
    var arrayData = [];

    for (var i = 1; i <= repeticoes; i++) {
        var data = new Date(dataBrasileira);
        data.setDate(data.getDate() + i * periodo)
        arrayData.push(data);
    }
    return arrayData;
}

document.getElementById('mostrarSubform').addEventListener('change', function () {
    var subform = document.getElementById('subform');
    subform.style.display = this.checked ? 'block' : 'none';
});

document.getElementById('valor_consulta').addEventListener('input', function () {
    let valor = this.value.replace(/\D/g, ''); // Remove tudo que não é número

    if (valor.length > 0) {
        // Divide o valor por 100 para adicionar os centavos
        valor = (parseFloat(valor) / 100).toFixed(2);
    }

    // Atualiza o campo com o valor formatado como número (sem "R$")
    this.value = valor;
});


function converterDataFormatoBrasileiroParaISO(data) {
    var partes = data.split("/");
    return partes[2] + "-" + partes[1] + "-" + partes[0];
}

function agendamento(event) {
    event.preventDefault();

    const ehAluno = document.getElementById("eh_aluno").checked;
    const form = document.getElementById("formagendamento");
    const { agendamentoid: agendamentoId } = form.dataset;

    const inputs = {
        nome: nameinp.value,
        telefone: phoneinp.value,
        especialista: list.value,
        dataAtendimento: data_atendimentoinp.value,
        horarioConsulta: horario_consultainp.value,
        horarioTerminoConsulta: horariot_consultainp.value,
        valorConsulta: Number(valor_consultainpinp.value),
        statusConsulta: status_consultainp.value,
        statusPagamento: status_pagamentoinp.value,
        observacao: observacaoinp.value,
        Eh_Aluno: ehAluno,
    };

    const clearInputs = () => {
        nameinp.value = "";
        phoneinp.value = "";
        data_atendimentoinp.value = "";
        horario_consultainp.value = "";
        horariot_consultainp.value = "";
        valor_consultainpinp.value = "";
        status_consultainp.value = "";
        status_pagamentoinp.value = "";
        observacaoinp.value = "";
        document.getElementById("eh_aluno").checked = false;  // só para resetar o checkbox

    };



    let alertShown = false;

    const createAppointment = (data) => {
        fetch("/agendamento", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                if (!alertShown) {
                    alert("Paciente Agendado com sucesso!");
                    alertShown = true;  // Defina a flag para evitar alertas futuros
                }
                clearInputs();
                carregarLista(true).catch(console.error);
            })
            .catch(() => {
                if (!alertShown) {
                    alert("Erro ao Agendar");
                    alertShown = true;  // Defina a flag para evitar alertas futuros
                }
            });
    };

    const updateAppointment = (data) => {
        // Verifica se o status da consulta é "Cancelado" e o status do pagamento é "Pago"
        if (data.Status_da_Consulta === "Cancelado" && data.Status_do_pagamento === "Pago") {
            alert("Altere o Status do pagamento para 'Pendente' ou 'Cancelado' antes de atualizar.");
            return; // Interrompe a execução se as condições forem atendidas
        }

        // Prossegue com a atualização do agendamento se as condições não forem atendidas
        fetch("/agendamento", {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                alert("Paciente Atualizado com sucesso!");
                carregarLista(true).catch(console.error);

            })

            .catch(() => alert("Erro ao atualizar"));

    };



    const checkForConflicts = (data, callback, agendamentoId = null) => {
        if (data.Eh_Aluno) {
            callback(data);
            return;
        }
        // Adiciona o filtro de especialista à consulta
        fetch(`/agendamentos?data=${data.Data_do_Atendimento}&especialista=${data.Especialista}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar agendamentos.');
                }
                return response.json();
            })
            .then(existingAppointments => {
                console.log(existingAppointments, data, agendamentoId)
                // Verifica se há conflitos considerando o agendamento atual
                const agendamentosPrincipais = existingAppointments.filter(a => !a.Eh_Aluno);

                const conflict = agendamentosPrincipais.some(appt => {
                    if (agendamentoId && appt.id === agendamentoId) return false;

                    // Verifica se a data e o especialista são os mesmos
                    if (appt.Data_do_Atendimento !== data.Data_do_Atendimento || appt.Especialista !== data.Especialista) {
                        return false;
                    }
                    // Verifica se há sobreposição considerando todos os casos possíveis
                    return !(appt.Horario_de_Termino_da_consulta <= data.Horario_da_consulta ||
                        appt.Horario_da_consulta >= data.Horario_de_Termino_da_consulta);
                });

                if (conflict) {
                    alert("Horário já está ocupado. Escolha outro horário.");
                    alertShown = true;  // Defina a flag para evitar alertas futuros
                } else {
                    callback(data); // Chama a função callback para agendar
                }

                console.log(conflict);
            })
            .catch(error => {
                console.error('Erro ao verificar conflitos:', error);
                alertShown = false;  // Defina a flag para evitar alertas futuros
                // Trate o erro de forma apropriada, como exibir uma mensagem ao usuário
                alert('Ocorreu um erro ao verificar conflitos. Tente novamente mais tarde.');
            });
    };

    const appointmentData = {
        Nome: inputs.nome,
        Telefone: inputs.telefone,
        Especialista: inputs.especialista,
        Data_do_Atendimento: inputs.dataAtendimento,
        Horario_da_consulta: inputs.horarioConsulta,
        Horario_de_Termino_da_consulta: inputs.horarioTerminoConsulta,
        Valor_da_Consulta: inputs.valorConsulta,
        Status_da_Consulta: inputs.statusConsulta,
        Status_do_pagamento: inputs.statusPagamento,
        observacao: inputs.observacao,
        Eh_Aluno: ehAluno
    };

    if (appointmentData.isAluno && !appointmentData.observacao.includes('[ALUNO]')) {
        appointmentData.observacao = '[ALUNO] ' + appointmentData.observacao;
    }

    console.log(agendamentoId)

    if (agendamentoId === '0') {
        const datasFuturasProgramadas = calculadata();

        if (datasFuturasProgramadas.length > 0) {
            datasFuturasProgramadas.forEach(data => {
                const futureAppointmentData = {
                    ...appointmentData,
                    Data_do_Atendimento: data.toISOString().split('T')[0]
                };

                if (futureAppointmentData.Eh_Aluno) {
                    createAppointment(futureAppointmentData); // pula o filtro
                } else {
                    checkForConflicts(futureAppointmentData, createAppointment);
                }
            });
        }

        if (appointmentData.Eh_Aluno) {
            createAppointment(appointmentData); // pula o filtro
        } else {
            checkForConflicts(appointmentData, createAppointment);
        }
    } else {
        const updatedData = { id: agendamentoId, ...appointmentData };

        if (appointmentData.Eh_Aluno) {
            updateAppointment(updatedData); // pula o filtro
        } else {
            checkForConflicts(updatedData, updateAppointment, agendamentoId);
        }
    }




}
//ESPERA
function cadastro_espera(event) {
    event.preventDefault()
    fetch("/cadastro_paciente", {
        method: "POST",
        body: JSON.stringify({
            Nome: nameinp.value,
            Telefone: phoneinp.value,
            Convenio: convenioinp.value,
            Observacao: observacaoinp.value,
            // Especialista: list.value,
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json()).then(data => {
        alert("Paciente adicionado a lista de espera com sucesso!")
        window.location.reload()
    }).catch(() => alert("Erro ao adicionar"))
}

function AbrirEspera() {
    if (list.value === "-") {
        alert("Selecione o Especialista")
        return
    }
    const selectElement = document.getElementById('lista');
    const valorSelecionado = selectElement.value;
    // modEspera.showModal()
    loadItens(valorSelecionado)
    if (typeof modEspera.showModal === "function") {
        modEspera.showModal(); // Abre o modal
    } else {
        // Fallback para navegadores que não suportam showModal
        modEspera.style.display = "block";
    }
}
function espera(event) {
    event.preventDefault()
    const nameinp = document.getElementById("esp-name")
    const phoneinp = document.getElementById("esp-phone")
    const convenioinp = document.getElementById("esp-convenio")
    const observacaoinp = document.getElementById("esp-observacao")
    const id_agendamento = document.getElementById("id_agendamento")

    fetch('/Lista_espera', {
        method: 'POST',
        body: JSON.stringify({
            Nome: nameinp.value,
            Telefone: phoneinp.value,
            Convenio: convenioinp.value,
            Observacao: observacaoinp.value,
            Especialista: list.value,
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(() => {
        const selectElement = document.getElementById('lista');
        const valorSelecionado = selectElement.value;
        loadItens(valorSelecionado)
        alert("Paciente adicionado a lista de espera com sucesso!")

        nameinp.value = '';
        phoneinp.value = '';
        convenioinp.value = '';
        observacaoinp.value = '';

    }).catch(() => alert("Erro ao adicionar"))
}

// loadintens espera
const getItensBD = async (Especialista) => {
    const response = await fetch(`/Lista_espera/${Especialista}`)
    items = await response.json()
}

function insertItem(item, index) {
    let tr = document.createElement("tr");
    tr.innerHTML = `
<td>${item.Nome}</td>
<td>${item.Telefone}</td>
<td>${item.Convenio}</td>
<td>${item.Especialista}</td>
<td>${item.Observacao}</td>
<td class="columnAction">
    <button onclick="deleteItem(${index})"><i class="bi bi-trash"></i></button>
</td>
`;
    tbody.appendChild(tr);
}

const tbody = document.querySelector("tbody");
function loadItens(Especialista) {
    getItensBD(Especialista).then(() => {
        tbody.innerHTML = "";
        items.forEach((item, index) => {
            insertItem(item, index);
        });
    }).catch(console.error);
}

function deleteItem(index) {
    const itemToDelete = items[index]; // Pega o item pelo índice
    fetch(`/Lista_espera/${itemToDelete.id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        if (response.ok) {
            alert("Item deletado com sucesso!");
            loadItens(itemToDelete.Especialista); // Recarrega os itens após a exclusão
        } else {
            alert("Erro ao deletar o item.");
        }
    }).catch(() => alert("Erro ao deletar"));
}




// Event listener para fechar o modal
document.getElementById('btn-close-espera').addEventListener('click', () => {
    modEspera.close();
});



// CANCELADO

const tbodyCancelado = document.getElementById("tbodyCancelado");

const getConsultasBD = async (valuePacienteFiltrado) => {

    const response = await fetch("/agendamentos_filtrado?id=" + valuePacienteFiltrado, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    itemsCancelado = await response.json()
    itemsCancelado.map(arg => {
        arg.Nome = todosPacientes.find(({ id }) => id === arg.Nome).Nome
        return arg
    })
}

function loadConsultas(event) {

    event.preventDefault()
    let pacienteFiltrado = document.getElementById("age_name_cancelado");
    let valuePacienteFiltrado = pacienteFiltrado.value;
    getConsultasBD(valuePacienteFiltrado).then(() => {
        tbodyCancelado.innerHTML = "";
        itemsCancelado.forEach((item, index) => {
            insertItemCancelado(item, index);
        });

    }).catch(console.error)
}



function insertItemCancelado(item, index) {
    let tr = document.createElement("tr");

    // Converte a data de atendimento para o formato UTC
    const date = new Date(item.Data_do_Atendimento);

    // Ajuste de fuso horário manual
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    // Formata a data para o formato brasileiro (DD/MM/AAAA)
    const dataFormatada = adjustedDate.toLocaleDateString("pt-BR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });



    tr.innerHTML = `
      <td><input type="checkbox"></td>

      <td id="${item.id}">${item.Nome}</td>
      <td>${dataFormatada}</td>
      <td>${item.Horario_da_consulta}</td>
      <td>${item.Horario_de_Termino_da_consulta}</td>
      <td>${item.Status_da_Consulta}</td>
      <td>${item.Status_do_pagamento}</td>
     <td class="columnAction">
        <button type="button" onclick='showModal(${JSON.stringify(item, index)})'>
          <i class="bi bi-pencil"></i>
        </button>
        
      </td>
    `;

    tbodyCancelado.appendChild(tr);

}


function showModal(item) {
    // Define o ID do agendamento no dataset do formulário
    document.getElementById("formagendamento").dataset.agendamentoid = item.id;
    console.log("ID do agendamento:", item.id);

    // Preencher o modal com as informações do item
    const selectPaciente = document.getElementById('age_name');

    // Limpar opções existentes
    selectPaciente.innerHTML = '';

    // Buscar o paciente pelo nome para obter o ID
    const paciente = todosPacientes.find(({ Nome }) => Nome === item.Nome);

    if (paciente) {
        // Criar e adicionar a opção do paciente com ID como valor
        const option = document.createElement('option');
        option.value = paciente.id; // Usar o ID como valor
        option.text = paciente.Nome; // Exibir o nome do paciente
        selectPaciente.add(option);

        // Selecionar a opção correta
        selectPaciente.value = paciente.id; // Selecionar pelo ID

        // Adicionar evento change para atualizar o modal e enviar dados ao servidor
        selectPaciente.addEventListener('change', function () {
            const agendamentoId = document.getElementById("formagendamento").dataset.agendamentoid;
            const pacienteId = selectPaciente.value; // ID do paciente selecionado

            // Atualizar os campos do modal
            document.getElementById('modalAgendamentoId').textContent = `Agendamento ID: ${agendamentoId}`;
            document.getElementById('modalPacienteId').textContent = `Paciente ID: ${pacienteId}`;

            // Enviar dados para o servidor
            enviarDadosParaServidor(agendamentoId, pacienteId);
        });
    }

    // Preencher os outros campos do modal
    document.getElementById('phone').value = item.Telefone;
    document.getElementById('data_atendimento').value = item.Data_do_Atendimento;
    document.getElementById('horario_consulta').value = item.Horario_da_consulta;
    document.getElementById('horariot_consulta').value = item.Horario_de_Termino_da_consulta; // Testar valor fixo
    document.getElementById('valor_consulta').value = item.Valor_da_Consulta;
    document.getElementById('status_pagamento').value = item.Status_do_pagamento;
    document.getElementById('status_c').value = item.Status_da_Consulta;
    document.getElementById('observacao').value = item.observacao;

    // Adicione a linha para definir o ID do agendamento
    document.getElementById('id_agendamento').value = item.id;

    // Exibir o modal
    document.getElementById('mod-agen').showModal();

    // Função para enviar dados para o servidor
    function enviarDadosParaServidor(agendamentoId, pacienteId) {
        const data = {
            id: agendamentoId,
            PacienteId: pacienteId,
            Telefone: document.getElementById('phone').value,
            Data_do_Atendimento: document.getElementById('data_atendimento').value,
            Horario_da_consulta: document.getElementById('horario_consulta').value,
            Horario_de_Termino_da_consulta: document.getElementById('horariot_consulta').value,
            Valor_da_Consulta: document.getElementById('valor_consulta').value,
            Status_do_pagamento: document.getElementById('status_pagamento').value,
            Status_da_Consulta: document.getElementById('status_c').value,
            observacao: document.getElementById('observacao').value
        };

        // Verifica se o status da consulta é "Cancelado" e o status do pagamento é "Pago"
        if (data.Status_da_Consulta === "Cancelado" && data.Status_do_pagamento === "Pago") {
            alert("Altere o Status do pagamento para 'Pendente' ou 'Cancelado' antes de atualizar.");
            return; // Interrompe a execução se as condições forem atendidas
        }

        // Prossegue com a atualização do agendamento
        fetch("/agendamento", {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                alert("Paciente Atualizado com sucesso!");
                carregarLista(true).catch(console.error);


            })

            .catch(() => alert("Erro ao atualizar"));

    }

}



// Adicione um evento de fechamento para o botão "FECHAR"
document.getElementById('btn-close').addEventListener('click', function () {
    document.getElementById('mod-agen').close();
    loadConsultas(new Event('submit')); // Recarregar a lista

});



function deleteItemInDB(event, index) {
    fetch("/agendamento_desabilitado", {
        method: "PUT",
        body: JSON.stringify({
            id: index,
            Status_da_Consulta: "Cancelado",
            Status_do_pagamento: "Cancelado"
        }),
        headers: {
            "Content-Type": "application/json",
        },
    }).then(response => response.json()).then(data => {
        loadConsultas(event)
    })
}


function deleteSelectedRows(event) {
    event.preventDefault();

    var table = document.getElementById("tableCancelados");
    var checkboxes = table.querySelectorAll("input[type='checkbox']:checked");

    checkboxes.forEach(function (checkbox) {
        var row = checkbox.parentNode.parentNode;

        // Verifique se a célula de status do pagamento existe
        var statusPagamentoCell = row.cells[6]; // Ajuste o índice conforme a posição real da coluna
        var statusPagamento = statusPagamentoCell ? statusPagamentoCell.textContent.trim() : '';

        var parentTd = checkbox.parentElement;
        var nextTd = parentTd.nextElementSibling;
        var idDoElemento = nextTd ? nextTd.getAttribute('id') : '';

        if (statusPagamento === "Pago") {
            alert("Altere o Status do pagamento para 'Pendente' ou 'Cancelado'.");
        } else {
            deleteItemInDB(event, idDoElemento);
            alert("Agendamento cancelado com sucesso!");
        }
    });
}



var elementos = document.getElementsByClassName('trashCancelado');

// Itera sobre a lista de elementos
for (var i = 0; i < elementos.length; i++) {
    // Adiciona um ouvinte de evento de clique a cada elemento
    elementos[i].addEventListener('click', function (event) {
        // Impede o comportamento padrão do evento (neste caso, o clique)
        event.preventDefault();

        // Insira aqui o que você deseja fazer quando um elemento com a classe 'trashCancelado' for clicado
    });
}


document.getElementById('btn-close-cancelado').addEventListener('click', () => {
    modCancelado.close()
})

function AbrirCancelado() {
    if (list.value === "-") {
        alert("Selecione o Especialista")
        return
    }
    // modEspera.showModal()
    if (typeof modCancelado.showModal === "function") {
        modCancelado.showModal(); // Abre o modal
    } else {
        // Fallback para navegadores que não suportam showModal
        modCancelado.style.display = "block";
    }
}

let pacientesFiltradosCancelado = []
const nameinpcancelado = document.getElementById("age_name_cancelado")


document.getElementById('cancelado').addEventListener('click', () => {
    if (list.value === "-") {
        return
    }

    pacientesFiltradosCancelado = todosPacientes.filter(({ Especialista }) => Especialista === list.value)

    nameinpcancelado.innerHTML = ''
    pacientesFiltradosCancelado.forEach(item => {
        nameinpcancelado.innerHTML += `<option value="${item.id}">${item.Nome}</option>`
    })

    modCancelado.showModal()
});

function atendimento(id, nome) {
    const nomePaciente = age_name.options[age_name.selectedIndex].text;
    const url = new URL(window.location.href)
    url.pathname = "/sistema/atendimento/atendimento.html";
    url.searchParams.set("id", id);
    url.searchParams.set("id_paciente", nameinp.value);
    url.searchParams.set("nome", nomePaciente);
    window.location.href = url.toString()
}


const draggable = document.getElementById('draggable-container');
let isDraggable = true;
let mouseDown = false;

draggable.onmousedown = function (event) {
    if (!isDraggable) return;

    mouseDown = true;
    event.preventDefault();

    let shiftX = event.clientX - draggable.getBoundingClientRect().left;
    let shiftY = event.clientY - draggable.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        draggable.style.left = pageX - shiftX + 'px';
        draggable.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(event) {
        if (mouseDown) {
            moveAt(event.pageX, event.pageY);
        }
    }

    document.addEventListener('mousemove', onMouseMove);

    draggable.onmouseup = function () {
        mouseDown = false;
        document.removeEventListener('mousemove', onMouseMove);
    };
};

window.addEventListener("message", (event) => {
    if (event.data === "desligamouse") {
        draggable.width = "50"
        draggable.height = "50"
    }

    if (event.data === "ligamouse") {
        draggable.width = "400"
        draggable.height = "500"
    }

})

document.getElementById("open-chat-btn1").addEventListener("click", () => {
    window.location.href = '../chat/chat.html'
})

//botao ajuda


let Usuario = ""
const ajudaBtn = document.getElementById('ajudaBtn');
const ajudaPopup = document.getElementById('ajudaPopup');
const listaMensagens = document.getElementById('listaMensagens');
const especialista = Usuario
// Fecha o popup ao carregar a página
window.addEventListener('load', () => {
    ajudaPopup.style.display = 'none';
});


// Abre o popup e carrega as solicitações do backend
ajudaBtn.addEventListener('click', async () => {
    if (list.value === "-") {
        alert("Selecione o Especialista")
        return
    }
    else {
        ajudaPopup.style.display = 'flex';
    }

    try {
        const resp = await fetch(`/ajuda?especialista=${encodeURIComponent(especialista)}`);
        if (!resp.ok) throw new Error("Falha ao buscar ajudas");
        const dados = await resp.json();

        listaMensagens.innerHTML = ""; // limpa a lista antes de renderizar

        dados.forEach(item => {
            if (item.status === "Concluído") return;
            const agora = new Date(item.criadoEm);
            const data = agora.toLocaleDateString('pt-BR'); // ex: 21/07/2025
            const hora = agora.toLocaleTimeString('pt-BR', { hour12: false }); // ex: 20:35:12

            const div = document.createElement('div');
            div.classList.add('mensagem');
            div.dataset.id = item.id; // útil pra atualizações futuras

            div.innerHTML = `
  <p><strong>Chamado #${item.ticket}</strong>
     <strong> Data: ${data} Hora: ${hora}</strong>
    <strong>Local da ocorrência: ${item.tela}</strong>
  <p>${item.descricao}</p>
  <div class="botoes-status">
    <button type="button" disabled class="recebido ${item.status === 'Recebido' ? 'ativo' : ''}">Recebido</button>
    <button type="button" disabled class="andamento ${item.status === 'Em Andamento' ? 'ativo' : ''}">Em Andamento</button>
    <button type="button" disabled class="concluido ${item.status === 'Concluído' ? 'ativo' : ''}">Concluído</button>
  </div>
`;

            div.querySelectorAll('.botoes-status button').forEach(botao => {
                botao.addEventListener('click', () => {
                    div.querySelectorAll('.botoes-status button').forEach(b => b.classList.remove('ativo'));
                    botao.classList.add('ativo');
                    // Aqui você pode enviar um PUT para atualizar o status no backend
                });
            });

            listaMensagens.appendChild(div);
        });

        const inputFiltroTicket = document.getElementById("filtroTicket");
        const inputFiltroData = document.getElementById("filtroData");
        const inputFiltroTela = document.getElementById("filtroTela");

        function aplicarFiltros() {
            const termoTicket = inputFiltroTicket.value.trim().toLowerCase();
            const termoData = inputFiltroData.value.trim().toLowerCase();
            const termoTela = inputFiltroTela.value.trim().toLowerCase();

            document.querySelectorAll(".mensagem").forEach(div => {
                const texto = div.innerText.toLowerCase();

                const matchTicket = !termoTicket || texto.includes(termoTicket);
                const matchData = !termoData || texto.includes(termoData);
                const matchTela = !termoTela || texto.includes(termoTela);

                div.style.display = matchTicket && matchData && matchTela ? "block" : "none";
            });
        }

        inputFiltroTicket.addEventListener("input", aplicarFiltros);
        inputFiltroData.addEventListener("input", aplicarFiltros);
        inputFiltroTela.addEventListener("input", aplicarFiltros);


    } catch (err) {
        console.error(err);
        alert("Erro ao carregar solicitações de ajuda.");
    }
});


function fecharAjuda() {
    ajudaPopup.style.display = 'none';
}

async function enviarAjuda() {
    const tela = document.getElementById('tela').value;
    const descricao = document.getElementById('descricao').value;

    if (!tela || !descricao.trim()) {
        alert('Preencha todos os campos!');
        return;
    }

    try {
        const response = await fetch("/ajuda", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tela,
                descricao,
                especialista: list.value // <-- enviar nome do especialista logado
            })
        });

        if (!response.ok) throw new Error("Erro ao enviar ajuda");

        ajudaBtn.click();
        document.getElementById('descricao').value = '';
        document.getElementById('tela').selectedIndex = 0;

        alert('Ajuda enviada com sucesso!');
        fecharAjuda();
    } catch (error) {
        console.error(error);
        alert('Erro ao enviar ajuda. Tente novamente.');
    }
}

let ajudasCache = new Map();

async function buscarAjudas() {
    try {
        const resp = await fetch(`/ajuda?especialista=${encodeURIComponent(especialista)}`);
        if (!resp.ok) throw new Error("Erro ao buscar ajudas");
        const dados = await resp.json();

        // Verifica mudanças de status comparando com cache local
        dados.forEach(item => {
            const cacheItem = ajudasCache.get(item.id);

            if (cacheItem && cacheItem.status !== item.status) {
                // Status mudou! Mostrar notificação
                mostrarNotificacaoStatus(item);
            }

            // Atualiza cache
            ajudasCache.set(item.id, item);
        });

        // Atualiza a lista visível (se quiser)
        // atualizarListaAjudaNaTela(dados);

    } catch (err) {
        console.error("Erro ao buscar ajudas no polling:", err);
    }
}

function mostrarNotificacaoStatus(item) {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    const hora = agora.toLocaleTimeString('pt-BR', { hour12: false });

    const ticket = item.id.split('-')[0];

    // Mapeia o status para a classe correta
    let statusClasse = '';
    if (item.status === 'Recebido') statusClasse = 'recebido';
    else if (item.status === 'Em Andamento') statusClasse = 'andamento';
    else if (item.status === 'Concluído') statusClasse = 'concluido';

    // Cria a notificação
    const notif = document.createElement('div');
    notif.className = `notificacao-status ${statusClasse}`;
    notif.innerHTML = `
    NsBaseTech informa: <br>
    <strong>Chamado #${ticket}</strong> <br>
    atualizado para <em>${item.status}</em><br>
    <small>${data} ${hora}</small><br>

    <button class="btn-ok" style="align-items:center";>OK</button>
  `;

    // Adiciona evento ao botão OK para remover a notificação
    const btnOk = notif.querySelector('.btn-ok');
    btnOk.addEventListener('click', () => {
        notif.remove();
        if (ajudaPopup.style.display !== 'none') {
            ajudaBtn.click(); // atualiza a lista de chamados se o popup estiver aberto
        }
    });

    document.body.prepend(notif);

}

// Começa o polling a cada 10 segundos
setInterval(buscarAjudas, 5000);
buscarAjudas(); // chama imediatamente ao carregar

const servantsContainer = document.getElementById("servantsContainer");
const classIconsContainer = document.getElementById("classIconsContainer");
const mainContent = document.getElementById("mainContent");
const tutorialContainer = document.getElementById('tutorialContainer');
const tutorialText = document.getElementById('tutorialText');
const nextBtn = document.getElementById('nextBtn');
const viewServantsBtn = document.getElementById("viewServantsBtn");

let qp = localStorage.getItem("qp") ? parseInt(localStorage.getItem("qp")) : 0;


const saberServants = ["Altria Pendragon", "Okita Souji", "Charlemagne", "Gawain"];
const archerServants =["Emiya", "Gilgamesh", "Minamoto-no-Tametomo", "Atalante"];
const lancerServants = ["Hektor", "Enkidu", "Percival", "Gareth"];
const riderServants = ["Achilles", "Mandricardo", "Kyokutei Bakin", "Taigong Wang"];
const casterServants = ["Merlin", "Chen Gong", "Altria Caster", "Paracelsus von Hohenheim"];
const assassinServants = ["Emiya (Assassin)", "First Hassan", "Li Shuwen", "Gray"];
const berserkerServants = ["Lancelot", "Sen-no-Rikyu"];
const shielderServant = "Mash Kyrielight";

let battleMusic;
let bgmMusic;

const tutorialSteps = [
    "Hello, I'm Mash Kyrielight! Welcome to Chaldea, I'm here to show you arround!",
    "What's your name?",
    "",
    "Before we begin, would you like to skip the tutorial?",
    "In this game you are a Master, tasked with saving proper human history",
    "You'll have to select a group of 3 Servants, heroic spirits who left their mark on human history to save the world",
    "There are 8 classes available of Servants for you to choose",
    "The Three Knights, Saber, Lancer and Archer",
    "And the Four Cavalry, Rider, Caster, Assassin and Berserker",
    "And last is me, the Shielder class",
    "Once you choose your 3 Servants you can go to the View My Team button",
    "There you can remove a Servant from your party, level them up to level 4 or get to know them by reading their profiles.",
    "Once your party is ready you can click the Play button to choose a location and face off dangerous enemies",
    "When you are in battle you may choose to use your Servants' Noble Phantasm, powerful armaments made using human imagination as their core.",
    "If you win a battle you'll earn 100 Quantim Piece or QP, you can use it to level up your Servants!",
    "Great, now you know everything you need, good luck!"
];

let currentText = 0;
let team = JSON.parse(localStorage.getItem("team")) || [];

const saveTeamToStorage = () => {
    localStorage.setItem("team", JSON.stringify(team));
}
nextBtn.addEventListener("click", ()=>{
    if(currentText === 1){
        askUsername();
    }else if(currentText === 3){
        askSkipTutorial();
    }else{
        nextTutorialStep();
    }
});
//Si el usuario nunca entro en la pagina se abre el tutorial
document.addEventListener('DOMContentLoaded', () =>{
    if(!localStorage.getItem("tutorialCompleted")){
        startTutorial();
    }else{
        endTutorial();
        showMainContent();
        loadClassIcons();
        filterServantsByClass("saber")
    }
});

viewServantsBtn.addEventListener("click", ()=> {
    if(battleMusic){
        battleMusic.pause();
        battleMusic.currentTime = 0;
    }
    servantsContainer.style.display = "block";
    teamContainer.style.display = "none";
    game.style.display = "none";
    loadClassIcons();
});

//Logica del tutorial:


//Comienza el tutorial llamando a typeText que escribe el primer paso del array
const startTutorial = () => {
    tutorialContainer.style.display = 'flex';
    currentText = 0;
    typeText(tutorialSteps[currentText]);
};

/*Metodo encargado de escribir el texto en pantalla
con un efecto de animación letra por letra*/
const typeText = (text) => {
    tutorialText.innerHTML = '';
    text.split('').forEach((letter, index) => { //Divido todo el texto en caracteres individuales
        let span = document.createElement("span");
        span.textContent = letter;
        tutorialText.appendChild(span);
    });
    //Animejs anime las letras
    anime({
        targets: "#tutorialText span",
        opacity: [0, 1],
        translateY: [20, 0],
        easing: "easeOutExpo",
        duration: 100,
        delay: anime.stagger(50)
    });
};
/*Este metodo es el encargado de pasar a la siguiente parte del tutorial
Aumenta el currentText para pasar al siguiente paso y
verifica si quedan pasos en el tutorial, si no quedan
llama a endTutorial()*/
const nextTutorialStep = () =>{
    anime.remove("#tutorialText span");
    currentText++;
    if(currentText < tutorialSteps.length){
        typeText(tutorialSteps[currentText]);
    }else{
        endTutorial();
    }
};
/*Se crea una alerta que le pide al usuario su nombre, se guarda
en localStorage y se le muestra un texto personalizado*/
const askUsername = () => {
    Swal.fire({
        title: "What's your name?",
        input: "text",
        inputPlaceholder: "Enter your name...",
        showCancelButton:false,
        confirmButtonText: "Next",
        allowOutsideClick: false
    }).then((result) =>{
        if(result.value){
            const userName = result.value;
            localStorage.setItem("userName", userName);
            typeText(`Nice to meet you, ${userName}!`);
            currentText++;
        }
    });
};

//Le pregunta al usuario si quiere saltarse el tutorial
const askSkipTutorial = () => {
    Swal.fire({
        title: "Would you like to skip the tutorial?",
        showCancelButton:true,
        confirmButtonText: "Yes, skip",
        cancelButtonText: "No, continue",
        allowOutsideClick: false
    }).then((result) =>{
        if(result.isConfirmed){
            endTutorial();
        }else{
            currentText++;
            typeText(tutorialSteps[currentText]);
        }
    });
};

const endTutorial = () => {
    localStorage.setItem("tutorialCompleted", true);
    tutorialContainer.style.display = "none";
    showMainContent();
    loadClassIcons();
    filterServantsByClass("saber");
};

const showMainContent = () => {
    mainContent.style.display = "block";
};


/*Metodo para añadir un Servant a tu equipo.
Checkea que el Servant no este en tu equipo y que el tamaño de tu equipo sea >=3
Si ninguna de estas condiciones es true pasa al else donde se añade al sirviente, se le dan las stats necesarias para el juego
y se reproduce una linea de voz.*/
const addServantToTeam = (servant) => {
    if(team.some(s => s.id === servant.id)){
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `${servant.name} is already in your team!`
        });
    }
    else if(team.length >=3){
        Swal.fire({
            icon: "warning",
            title: "Oops...",
            text: `Your team is complete!`
        });   
     }
    else {
        servant.gameLevel = 1;
        servant.gameNpAvaialable = true;
        servant.gameAlive = true;
        servant.gameMaxHp = servant.gameHp;
        assignStatsByClass(servant);
        team.push(servant);
        saveTeamToStorage();
        playVoiceline(servant, "summon"); 
        
     }


};




//Las estrellas representan que tan raro un sirviente es, con este método se generan estrellas basadas en el atributo "rarity" de los servants
const rarityStars = (rarity) => {

    let stars = '';
    for (let i= 0; i< rarity; i++){
        stars+= '★';
    }
    return stars;
};
const servantClassArrays = {
    saber: saberServants,
    archer: archerServants,
    lancer: lancerServants,
    rider: riderServants,
    caster: casterServants,
    assassin: assassinServants,
    berserker: berserkerServants,
    shielder: [shielderServant]
};

const servantStats = {
    saber: { gameHp: 1500, gameDmg: 300 },
    archer: { gameHp: 1200, gameDmg: 350 },
    lancer: { gameHp: 1400, gameDmg: 320 },
    rider: { gameHp: 1300, gameDmg: 330 },
    caster: { gameHp: 1000, gameDmg: 400 },
    assassin: { gameHp: 1100, gameDmg: 360 },
    berserker: { gameHp: 900, gameDmg: 450 },
    shielder: { gameHp: 2000, gameDmg: 200 }
};

/*Metodo encargado de asignar las estadisticas de los servants segun su clase
y actualizarlas si estos suben de nivel*/
const assignStatsByClass = (servant) => {
    const stats = servantStats[servant.className];
    if(stats){
        const levelUpStrenght = 1 + (servant.gameLevel -1) * 0.2 //Por cada level se aumenta un 20% las estadisticas
        
        servant.gameHp = Math.round(stats.gameHp * levelUpStrenght);
        servant.maxHp = servant.gameHp;
        servant.gameDmg = Math.round(stats.gameDmg * levelUpStrenght);
    }else{
        console.error("error en assignstatsbyclass");
    }
};

/*Método para conseguir desde la API los Servants, se hace un filter de la data para que solo te devuelvan 
los Servants de la clase que selecciones y solo si su nombre esta en el arreglo de Sirvientes*/
const filterServantsByClass = (className) => {
    servantsContainer.innerHTML = `
    <div class='text-center mt-5'>
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
`;

    fetch("https://api.atlasacademy.io/export/NA/nice_servant_lore.json")
.then(response => response.json())
.then(data => {
    const filteredServants = data.filter(servant => servant.className === className && servantClassArrays[className].includes(servant.name));
    displayServants(filteredServants);
})
.catch(error => {
        console.error("Error fetching servants: ", error);
        servantsContainer.innerHTML = '<div>Error loading servants. Please try again later.</div>';
    })
    };

    /*Muestra a los servants en el apartado de View Servants, muestra a todos los servants que se consiguen desde la API
    Los Servants estan dentro de una card la cual se puede expandir mostrandote una breve descripción del Servant y un boton
    para añadirlo a tu equipo*/
    const displayServants = (servants) => {

    servantsContainer.innerHTML ='';
    const servantGrid = document.createElement('div');
    servantGrid.classList.add("row",);

    servants.forEach(servant => {
        const servantCard = document.createElement("div");
        servantCard.classList.add('col-4', 'col-md-3', 'mb-4');
        console.log(servant);

        servantCard.innerHTML = `
        <div class="card h-100">
            <div class ="stars mb-3">${rarityStars(servant.rarity)}</div>
            <img src="${servant.extraAssets.charaGraph.ascension[1]}" class="card-img-top servant-size" alt="${servant.name}"/>
            <div class="card-body">
                <h5 class="card-title servant-name">${servant.name}</h5>
                    <span class="dropdown-arrow">▼</span>
                <div class="servant-description" style="display: none;">
                    <p class="card-text">${servant.profile.comments[0].comment}</p> <!-- Mostrar la clase del servant -->
                    <button class="btn btn-primary add-to-team-btn ">Summon Servant</button>
                </div>
            </div>
        </div>
        `;

        const descriptionElement = servantCard.querySelector(".servant-description");
        const addToTeamBtn = servantCard.querySelector(".add-to-team-btn");
        const dropdownArrow = servantCard.querySelector(".dropdown-arrow");
        servantCard.addEventListener('click', () => {
            const descriptionState = descriptionElement.style.display === "block";
            descriptionElement.style.display = descriptionState ? 'none' : 'block';
            dropdownArrow.textContent = descriptionState ? '▼' : '▲';
            
        });

        addToTeamBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addServantToTeam(servant);
        });

        servantGrid.appendChild(servantCard);

        anime({
            targets: servantCard,
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutExpo',
        });
    });
    servantsContainer.appendChild(servantGrid);
    };
    
    /*Con este metodo se llama a los iconos de cada clase de Servant.
    Cada icono tiene un eventListener que llama a filterServantByClass()
    Y así te muestra los servants de la clase que clickees*/
    const loadClassIcons =() =>{
        if (document.querySelector('.class-icon')) {
            return; 
        }
        const classes = [
            { name: 'saber', icon: 'images/class-Saber-Gold.webp' },
            { name: 'archer', icon: 'images/Class-Archer-Gold.webp' },
            { name: 'lancer', icon: 'images/Class-Lancer-Gold.webp' },
            { name: 'rider', icon: 'images/Class-Rider-Gold.webp' },
            { name: 'caster', icon: 'images/Class-Caster-Gold.webp' },
            { name: 'assassin', icon: 'images/Class-Assassin-Gold.webp' },
            { name: 'berserker', icon: 'images/Class-Berserker-Gold.webp' },
            { name: 'shielder', icon: 'images/Class-Shielder-Gold.webp' }
        ];
        classes.forEach(servantClass => {
            const icon = document.createElement("img");
            icon.src = servantClass.icon;
            icon.alt = servantClass.name;
            icon.classList.add("class-icon");
            icon.addEventListener("click", ()=> filterServantsByClass(servantClass.name));
            classIconsContainer.appendChild(icon);
            
        });
    };
    const removeClassIcons = () => {
        classIconsContainer.innerHTML = "";
    };
    //Logica para view team
    const viewTeamBtn = document.getElementById("viewTeamBtn");
    const teamContainer = document.getElementById("teamContainer");
    const qpDisplay = document.getElementById("qpDisplay");


    const updateQP = (amount) => {
        qp += amount;
        localStorage.setItem("qp", qp);
    };

    viewTeamBtn.addEventListener("click", () => {
        viewMyTeam();
        removeClassIcons();
    });

    /*Con este boton vas al apartado View My Team, primero checkea que tengas al menos un Servant en tu equipo y si eso es así llama a displayTeam()*/
    const viewMyTeam = () => {
        if(battleMusic){
            battleMusic.pause();
            battleMusic.currentTime = 0;
        }
        servantsContainer.style.display = "none";
        teamContainer.style.display = "block";
        game.style.display = "none";
        if(team.length === 0){
            teamContainer.innerHTML = `
            <div class="alert alert-info text-center mt-4">
                You don't have any Servants in your team yet. Go to the Servant list and add some to your team!
            </div>
            `;
        }else{
            displayTeam();
        }
       
    };
    /*Metodo para ver tu equipo actual, dentro de las cards se generan 3 botones
    Level Up, Details y Voice Lines*/
    const displayTeam = () => {
        teamContainer.innerHTML = "";
        teamContainer.appendChild(qpDisplay);
        qpDisplay.innerHTML = `QP: ${qp}`;

        const teamGrid = document.createElement("div");
        teamGrid.classList.add("row");

        team.forEach((servant, index) => {
            const servantCard = document.createElement("div");
            servantCard.classList.add('col-4', 'col-md-3', 'mb-4');

            let ascensionImage;
            if(servant.gameLevel === 3){
                ascensionImage = servant.extraAssets.charaGraph.ascension[2];
            }
            else if(servant.gameLevel === 4){
                ascensionImage = servant.extraAssets.charaGraph.ascension[3];
            }
            else if(servant.gameLevel === 5){
                ascensionImage = servant.extraAssets.charaGraph.ascension[4];
            }else{
                ascensionImage = servant.extraAssets.charaGraph.ascension[servant.gameLevel];

            }
            
            servantCard.innerHTML = `
            <div class="card h-100">
            <div class ="stars mb-3">${rarityStars(servant.rarity)}</div>
                <img src ="${ascensionImage}" class="card-img-top" id="servantImage-${servant.id}" alt="${servant.name}" />
                <div class="card-body">
                    <h5 class="card-title">${servant.name}</h5>
                    <button class="btn btn-info view-details-btn">Details</button>
                    <button class="btn btn-success lvl-up-btn">Level up</button>
                    <button class="btn btn-primary talk-btn">Voice Lines</button>
                    <p><strong>Level:</strong> ${servant.gameLevel}</p>
                    <p><strong>HP:</strong> ${servant.gameHp}</p>
                    <p><strong>DMG:</strong> ${servant.gameDmg}</p>
                    <button class="btn btn-danger remove-servant">Remove from Party</button>
                </div>
            </div>
            `;
            console.log(servant);
            servantCard.querySelector(".view-details-btn").addEventListener("click", ()=>{
                showServantDetails(servant);
            });
            servantCard.querySelector(".remove-servant").addEventListener("click", ()=>{
                removeServantFromParty(index);
            });
            servantCard.querySelector(".lvl-up-btn").addEventListener("click", ()=>{
                lvlUpServant(servant);
            });
            servantCard.querySelector(".talk-btn").addEventListener("click", ()=>{
                playVoiceline(servant, "homevoicelines");
            });
            teamGrid.appendChild(servantCard);
        });
        teamContainer.appendChild(teamGrid);

    };

    //Se crea una alerta que contiene detalles del perfil del Servant
    const showServantDetails = (servant) => {
        let ascensionFaceImage = servant.extraAssets.faces.ascension[servant.gameLevel];
        const profile6 = servant.profile.comments[6] ? `
        <div class="mb-3 border p-3">
                <strong>Profile 6</strong>
                <p>${servant.profile.comments[6].comment}</p>
            </div>
            ` : '';
        Swal.fire({
            title: servant.name,
            html: `
            <div class="text-center mb-3">
                <img src="${ascensionFaceImage}" class="img-fluid" alt="${servant.name}" />
            </div>
            <div class="mb-3">
                <strong>CV</strong>
                <p>${servant.profile.cv}</p>
            </div>
            <div class="mb-3">
                <strong>Illustrator </strong>
                <p>${servant.profile.illustrator}</p>
            </div>
            <div class="mb-3 border p-3">
                <strong>Character Info</strong>
                <p>${servant.profile.comments[0].comment}</p>
            </div>
            <div class="mb-3 border p-3">
                <strong>Profile 1</strong>
                <p>${servant.profile.comments[1].comment}</p>
            </div>
             <div class="mb-3 border p-3">
                <strong>Profile 2</strong>
                <p>${servant.profile.comments[2].comment}</p>
            </div>
             <div class="mb-3 border p-3">
                <strong>Profile 3</strong>
                <p>${servant.profile.comments[3].comment}</p>
            </div>
             <div class="mb-3 border p-3">
                <strong>Profile 4</strong>
                <p>${servant.profile.comments[4].comment}</p>
            </div>
             <div class="mb-3 border p-3">
                <strong>Profile 5</strong>
                <p>${servant.profile.comments[5].comment}</p>
            </div>
             ${profile6}
            `,
            showCloseButton:true,
            focusConfirm:false,
            confirmButtonText: "Close",
            
        });
    };

    //Metodo para remover un Servant de tu equipo
    const removeServantFromParty =(index) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to remove this Servant from your party?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            reverseButtons: true
        }).then((result) => {
            if(result.isConfirmed){
                Swal.fire({
                    title: "Removed",
                    text: "Your Servant has been removed",
                    icon: "success"
                });
                team.splice(index, 1);
                saveTeamToStorage();
                viewMyTeam();
            }else if (result.dismiss === Swal.DismissReason.cancel){
                Swal.fire({
                    title: "Cancelled",
                    text: "Your Servant is still in your party",
                    icon: "error"
                });
            }
        });
        
    };

    /*Metodo para subir de nivel tu Servant, hace que el nivel máximo sea 5 y crea distintas alertas para varios casos
    Si el servant sube de nivel con éxito se le actualizan los stats y este dice una linea de voz*/
    const lvlUpServant = (servant) => {
        if (qp >= 100 && servant.gameLevel < 5){
           
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to spend 100QP to level up your Servant?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                reverseButtons: true
            }).then((result) => {
                if(result.isConfirmed){
                    qp-= 100;
                    servant.gameLevel++;
                    assignStatsByClass(servant);
                    saveTeamToStorage();
                    viewMyTeam();
                    playVoiceline(servant, "ascension");
                }
                else if (result.dismiss === Swal.DismissReason.cancel){
                    Swal.fire({
                        title: "Cancelled",
                        text: "Your Servant has not leveled up",
                        icon: "error"
                    });
                }
            });
        } else if (servant.gameLevel >= 5){
            Swal.fire({
                icon: "warning",
                title: "Oops...",
                text: `Your Servant is Already at Max Level.`
            });   
        }else {
            Swal.fire({
                icon: "warning",
                title: "Oops...",
                text: `You need at least 100QP to Level Up.`
            });   
        }
        displayTeam();
    };

    //Logica para Play:

    const playGameBtn = document.getElementById("playGameBtn");
    const game = document.getElementById("game");
    const sectionsContainer = document.getElementById("sectionsContainer");
    const combatArea = document.getElementById("combatArea");
   

    //Uso la API para conseguir los banners de la id 100 a la id 107
    const getBanners =  async () => {
        sectionsContainer.innerHTML = `
    <div class='text-center mt-5'>
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
`;
        try {
            const bannerData = [];
            for (let i = 100; i<= 107; i++){
                bannerData.push(fetch(`https://api.atlasacademy.io/nice/NA/war/${i}`)
                .then(res => res.json()));
            }
            const banners = await Promise.all(bannerData);
            displayBanners(banners);
        } catch (error) {
            console.error(error);
        }
    };

    //Muestro los banners y uso una condición para que el único banner disponible es el que tiene id de 100
    const displayBanners = (banners) => {
        sectionsContainer.innerHTML = '';
        banners.forEach((banner, index) => {
            const bannerContainer = document.createElement("div");
            bannerContainer.classList.add("d-flex", "flex-row", "align-items-center", "mb-4");
            
            const bannerImg = document.createElement("img");
            bannerImg.src = banner.banner;
            bannerImg.classList.add("banner-img", "m-2", "img-fluid", "me-5", "mt-5");
            bannerImg.alt=`Banner for war ${banner.name}`
            const headerImg = document.createElement("img");
            headerImg.src = banner.headerImage;
            headerImg.classList.add("banner-header", "img-fluid", "mt-5");
            headerImg.alt=`Header for war ${banner.name}`

            if(banner.id === 100){
                bannerImg.classList.add("clickeable");
                bannerImg.addEventListener("click", () => showFightOptions());
            }else{
                bannerImg.style.filter = "grayscale(100%)";
                bannerImg.addEventListener("click", ()=> fightUnavailable(banner.longName));
            }
            bannerContainer.appendChild(bannerImg);
            bannerContainer.appendChild(headerImg);

            sectionsContainer.appendChild(bannerContainer);
           
        });
        anime({
            targets: '.banner-img',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 1000,
            delay: anime.stagger(200), 
            easing: 'easeOutQuad'
        });
        anime({
            targets: '.banner-header',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 1000,
            delay: anime.stagger(200), 
            easing: 'easeOutQuad'
        });
    };

    const fightUnavailable = (warName) => {
        Swal.fire({
            title: "Singularity Unavailable",
            text: `${warName} is not available, please choose another one.`,
            icon: "error"
        });
    }

    //Remueve todo lo que no este en la parte del juego que es "Play" y llama a los banners con getBanners();
    playGameBtn.addEventListener("click", ()=>{
        if(battleMusic){
            battleMusic.pause();
            battleMusic.currentTime = 0;
        }
        classIconsContainer.style.display = "none";
        servantsContainer.style.display = "none";
        teamContainer.style.display = "none";
        combatArea.style.display="none";
        combatArea.innerHTML=``;
        game.style.display = "block";
        
        removeClassIcons();
        getBanners();
    });

    /*Se abre una alert donde te muestra las 3 secciones/niveles del juego.
    Busca en el localStorage si la sección fue completada, si es completada le añade un tick*/
    const showFightOptions = () => {
        startBgmMusic();

        const firstFightCompleted = localStorage.getItem("section1") === "true";
        const secondFightCompleted = localStorage.getItem('section2') === 'true';
        const thirdFightCompleted = localStorage.getItem('section3') === 'true';
        
        Swal.fire({
            title: "Choose your fight!",
            html:`
            <div>
                <button id="firstFight" class="btn btn-primary m-2"><strong>Section 1:</strong> Burning Town ${firstFightCompleted ? '✅': ''}</button>
                <button id="secondFight" class="btn btn-primary m-2"><strong>Section 2:</strong> Danger Zone ${secondFightCompleted ? '✅': ''}</button>
                <button id="thirdFight" class="btn btn-primary m-2"><strong>Section 3:</strong> Grand Order ${thirdFightCompleted ? '✅': ''}</button>
            </div>
            `,
            showConfirmButton: false,
            customClass: {
                popup: "custom-alert"
            },
            willClose: () => {
                if(bgmMusic){
                    bgmMusic.pause();
                    bgmMusic.currentTime = 0;
                }
            }
        });

        document.getElementById('firstFight').addEventListener('click', () => startFight(1));
        document.getElementById('secondFight').addEventListener('click', () => startFight(2));
        document.getElementById('thirdFight').addEventListener('click', () => startFight(3)); 
    };
    let isGameWon = false;
    const logArea = document.createElement("div");
    logArea.id = "logArea";
    logArea.style.maxHeight = "200px";
    logArea.style.overflowY = "auto";
    logArea.className = "p-3 bg-light text-dark border"
    let currentEnemy = 0;
    let currentTurn = 0;
    let totalTurns = 0;

    //Todos los enemigos del juego
    const enemies = [ 
    {
        id: 1,
        name: "Skeleton",
        hp: 3500,
        attack: 300,
        alive: true,
        image: "images/Skeleton_SaberCut.png",
        isBeaten: false,
        section: 1
    },
    {
        id: 2,
        name: "Dragon",
        hp:8500,
        attack: 450,
        alive: true,
        image: "images/GreatDragon_Sheet.webp",
        isBeaten: false,
        section: 2

    },
    {
        id: 3,
        name: "Altria Alter",
        hp: 11500,
        attack: 550,
        alive: true,
        noblePhantasm:"Excalibur Morgan",
        image: "images/S003_Stage1.webp",
        isBeaten: false,
        noblePhantasmAudio: [
            "https://static.atlasacademy.io/NA/Audio/NoblePhantasm_100200/11_B051.mp3",
            "https://static.atlasacademy.io/NA/Audio/NoblePhantasm_100200/11_B800.mp3",
            "https://static.atlasacademy.io/NA/Audio/NoblePhantasm_100200/0_B800.mp3"
        ],
        section: 3
        
    },
    ];
    let enemy = enemies[currentEnemy];

    const markCompletedSection = (fightId) => {
        localStorage.setItem(`section${fightId}`, "true");
    };
    
    //Dependiendo de la seccion/nivel la música de combate será distinta
    const startBattleMusic = (fightId) =>{
        if(battleMusic){
            battleMusic.pause();
            battleMusic.currentTime = 0;
        }

        const musicUrl = fightId === 3
        ?"https://static.atlasacademy.io/NA/Audio/Bgm/BGM_BATTLE_4/BGM_BATTLE_4.mp3"
        : "https://static.atlasacademy.io/NA/Audio/Bgm/BGM_BATTLE_1/BGM_BATTLE_1.mp3";
    
        battleMusic = new Audio(musicUrl);
        battleMusic.volume = 0.2;
        battleMusic.loop = true;
        battleMusic.play();
    };

    const startBgmMusic = () =>{
        if(bgmMusic){
            bgmMusic.pause();
            bgmMusic.currentTime = 0;
        }

            const bgmMusicUrl = "https://static.atlasacademy.io/NA/Audio/Bgm/BGM_MAP_1/BGM_MAP_1.mp3";
            bgmMusic = new Audio(bgmMusicUrl);
            bgmMusic.volume = 0.2
            bgmMusic.loop = true;
            bgmMusic.play();
       
    };

    
    /*Muestra la interfaz de combate, uso un map para mostrar los stats 
    y caras de los servants en el array team
    */
    const showCombatInterface = () => {
        combatArea.innerHTML = ``
        sectionsContainer.innerHTML=``;
        combatArea.innerHTML = `
        <div>
            <h2 class="text-center">Enemy: ${enemy.name}</h2>
            <img src="${enemy.image}" alty="${enemy.name}" class="img-fluid mb-3 enemy-image" />
            <p class="text-center">HP: <span id="enemyHp">${enemy.hp}</span></p>
        </div>
        <div id="teamArea" class="d-flex justify-content-center flex-wrap mb-4">
        ${team.map((servant, index) => {
            let ascensionFaceImage;
            if (servant.gameLevel === 3) {
                ascensionFaceImage = servant.extraAssets.faces.ascension[2]; 
            } else if (servant.gameLevel === 4) {
                ascensionFaceImage = servant.extraAssets.faces.ascension[3]; 
            } else if (servant.gameLevel === 5) {
                ascensionFaceImage = servant.extraAssets.faces.ascension[4]; 
            } else {
                ascensionFaceImage = servant.extraAssets.faces.ascension[servant.gameLevel];
            }

            return (`
                <div id="servant${index}" class="m-5">
                    <h3>${servant.name}</h3>
                    <img class="img-fluid mb-2 rounded" src="${ascensionFaceImage}" alt="${servant.name}" />
                    <p>HP: <span id="servantHp${index}">${servant.gameHp}</span></p>
                    <p>DMG: <span id="servantDmg${index}">${servant.gameDmg}</span></p>
                    <button class="btn btn-success me-2" id="attackBtn${index}" disabled>Attack</button>
                    <button class="btn btn-warning me-2" id="npBtn${index}" disabled>Noble Phantasm</button>
                </div>
            `);
        }).join('')}
    </div>
`;
        combatArea.appendChild(logArea);
                
    };

    //Encargado de mostrarle al usuario lo que pasa en combate con texto
    const logMessage=(message) => {
        const messageElement = document.createElement('p');
        messageElement.innerHTML = message;
        logArea.appendChild(messageElement);
        logArea.scrollTop = logArea.scrollHeight;
    }

    /*Se ejecuta cada vez que empieza una pelea, resetea las stats con resetGame() 
    y muestra la interfaz de combate y tus acciones */
    const startFight = (fightId) => {
        Swal.close();
        startBattleMusic(fightId);
        logArea.innerHTML=``;
        combatArea.appendChild(logArea);
        combatArea.style.display = "block";
        currentEnemy = fightId -1;
        enemy = enemies[currentEnemy];
        resetGame();
        logMessage(`You chose to fight in Section ${fightId}: ${enemy.name}`);
        currentTurn = 0;
        totalTurns = 0;
        showCombatInterface();
        displayActionsForCurrentTurn();
    };
    let isUsingNoblePhantasm = false;

    /*Gestiona que botones estan habilitados para que Servant */
    const displayActionsForCurrentTurn = () => {
        const servant = team[currentTurn];
        logMessage(`${servant.name}'s Turn`);

        //Checkea si Altria Alter esta usando su ataque especial, de esta forma el usuario no puede pegarle mientras se ejecuta la animación.
        if (isUsingNoblePhantasm) {
            document.getElementById(`attackBtn${currentTurn}`).disabled = true;
            document.getElementById(`npBtn${currentTurn}`).disabled = true;
            return;
        }
     
        document.getElementById(`attackBtn${currentTurn}`).disabled = false;
        document.getElementById(`npBtn${currentTurn}`).disabled = !servant.gameNpAvaialable; //Solo se habilita si gameNpAvailable es true


        //onclick para atacar, cuando el Servant ataca se deshabilitan los 2 botones.
        document.getElementById(`attackBtn${currentTurn}`).onclick = ()=>{
        animateServantAttack(currentTurn);
           attack(servant);
           document.getElementById(`attackBtn${currentTurn}`).disabled = true;
           document.getElementById(`npBtn${currentTurn}`).disabled = true;
           
           currentTurn++;
            nextTurn();
        };

        //onclick para el ataque especial, cuando el Servant ataca se deshabilitan los 2 botones y gameNpAvailable es false.
        document.getElementById(`npBtn${currentTurn}`).onclick = ()=>{
            useNoblePhantasm(servant);
            document.getElementById(`attackBtn${currentTurn}`).disabled = true;
            document.getElementById(`npBtn${currentTurn}`).disabled = true;
            servant.gameNpAvaialable = false;
             currentTurn++;
             nextTurn();
         };

    };
    /*Se encarga este método de avanzar el turno del combate
     alternando entre los Servants y el enemigo */
    const nextTurn = () => {
        if (enemy.hp <= 0) {
            return; 
        }
        if (isUsingNoblePhantasm) {
            return; 
        }

        // Buscar el siguiente aliado vivo
        while (currentTurn < team.length && !team[currentTurn].gameAlive) {
            currentTurn++; // Incrementar currentTurn hasta encontrar un Servant vivo
        }
    
        // Si currentTurn es menor al tamaño de tu equipo entonces alguien esta vivo
        if (currentTurn < team.length) {
            if (enemy.hp > 0) {
                displayActionsForCurrentTurn();
            }
        } else {
            //Si todos los aliados terminaron su turno, entramos al else y es turno del enemigo
            logMessage("Enemy turn");
            enemyTurn(); 
            currentTurn = 0; 
    
            // Se vuelve a buscar al Servant vivo
            while (currentTurn < team.length && !team[currentTurn].gameAlive) {
                currentTurn++;
            }
    
            if (currentTurn < team.length) {
                if (enemy.hp > 0) {
                    displayActionsForCurrentTurn();
                }
            }
        }
        
        console.log(currentTurn);

    };
    //Actualiza las stats de manera dinámica en el combate
    const updateStats = () => {
        document.getElementById("enemyHp").innerText = enemy.hp;
        team.forEach((servant, index) => {
            document.getElementById(`servantHp${index}`).innerText = servant.gameHp;
            animateHpChange(index);
            //Si el Servant esta muerto su imagen cambia a blanco y negro
            if(!servant.gameAlive){
                const servantImage = document.querySelector(`#servant${index} img`);
                servantImage.style.filter = "grayscale(100%)";
                
            }
        });
    };
    /*El Servant ataca y se le resta el daño que hace a la vida del enemigo
    Se llama a una linea de voz y se actualizan las stats */
    const attack = (servant) => {
        if(enemy.hp > 0){
            playVoiceline(servant, "attack");
            const damage = servant.gameDmg;
            enemy.hp -= damage;
            logMessage(`${servant.name} deals ${damage}!`);
            updateStats();
            animateEnemyDamage();
        }
        
    };
    //Similar a el metodo de attack pero con el ataque especial
    const useNoblePhantasm = (servant) => {
        if(servant.gameNpAvaialable){
            animateUserNoblePhantasm(team.indexOf(servant));
            const damage = Math.floor(servant.gameDmg * 1.4);
            enemy.hp -= damage;
            servant.gameNpAvaialable = false;
            playVoiceline(servant, "noblephantasm")
           
            logMessage(`<strong style ="color:blue;">${servant.name} uses ${servant.noblePhantasms[0].name} and deals ${damage} damage!</strong>`);
            updateStats();
            animateEnemyDamage();
        }
    };
    
    //Encargado de parar el juego si el usuario pierde, muestra una alerta para volver
    const loseGame = () => {
        if(battleMusic){
            battleMusic.pause();
            battleMusic.currentTime = 0;
        }
        team.forEach((servant, index) => {
            document.getElementById(`attackBtn${index}`).disabled = true;
            document.getElementById(`npBtn${index}`).disabled = true;
        });

        Swal.fire({
            title: "Defeated",
            text: "You have been defeated, level up your Servants and try again",
            icon: "error",
            confirmButtonText: "Return"
        }).then(() => {
            combatArea.innerHTML=``;
            combatArea.style.display="none";
            getBanners();
        });

        logArea.remove();
    };

    const enemyTurn = () => {
        if(team.every(servant => !servant.gameAlive)){
            loseGame();
            return;
        }
        currentTurn++;
        totalTurns++;
    
        let targetServant;
        /*Se genera un numero aleatorio y ataca al sirviente que esta
         en ese numero del arreglo team
         se usa el while para que solo ataque a Servants que estan vivos*/
        do {
            const targetNumber = Math.floor(Math.random() * team.length);
            targetServant = team[targetNumber];
        } while (!targetServant.gameAlive);

        //Si el enemigo es Altria Alter, cada 3 turnos va a dar una advertencia de su ataque especial
            if(enemy.name === "Altria Alter" && totalTurns % 4 === 3){
                logMessage(`<strong style="color:orange;">Altria Alter is charging her Noble Phantasm!</strong>`);
            }
            //Cada 4 turnos lanza su ataque especial
            else if (enemy.name === "Altria Alter" && totalTurns %4 === 0){
                altriaNoblePhantasm();
            }
            //El servant recibe daño del enemigo
            else {
                const damage = enemy.attack;
                targetServant.gameHp -= damage;
                logMessage(`<strong style="color:purple;">${enemy.name} attacks ${targetServant.name} and deals ${damage}!</strong>`);
                updateStats();
            }
        
            //Si muere el targetServant gameAlive se vuelve false, se reproduce una linea de voz y se actualizan las stats
        if (targetServant.gameHp <= 0){
            targetServant.gameAlive = false;
            logMessage(`<strong style="color:red;">${targetServant.name} has been defeated!</strong>`);
            playVoiceline(targetServant, "incapacitated");

            updateStats();
        }
        if (team.every(servant => !servant.gameAlive)){
            loseGame();
        }
    };
    
    //Index usado 1 vez para hacer coincidir numeros randoms en los metodos winGame() y playVoiceLine()
    let randomIndexGlobal;

    /*Cuando se llama a winGame se desactivan los botones, un servant al azar reproduce 
    una linea de voz y se crea una alerta notificando al usuario de
    cuantos QP gano, se muestra el texto de la linea de voz y la
    cara del Servant que esta hablando. */
    const winGame = () => {
        isGameWon = true;
        team.forEach((servant, index) => {
            document.getElementById(`attackBtn${index}`).disabled = true;
            document.getElementById(`npBtn${index}`).disabled = true;
            });
        if(battleMusic){
            battleMusic.pause();
            battleMusic.currentTime = 0;
        }
        enemy.alive = false;
        const randomTeamMember = Math.floor(Math.random() * team.length);
        playVoiceline(team[randomTeamMember], "victory");

        const victoryVoiceLines = team[randomTeamMember].profile.voices.find(voice => voice.type === "battle").voiceLines;
        const victoryTextAssets = victoryVoiceLines
            .filter(line => line.name.toLowerCase().includes("victory"))
            .flatMap(line=>line.subtitle);

        const randomTextFile = victoryTextAssets[randomIndexGlobal];
        console.log("randomIndex win game " + randomIndexGlobal);

        console.log(victoryVoiceLines);
        console.log(victoryTextAssets);
        console.log(randomTextFile);
        enemy.hp = 0;
        updateStats();

        let ascensionFaceImage;
        const selectedServant = team[randomTeamMember]; 
/*En FGO los servants pasan por distintas etapas que se llaman "ascension" las cuales cambian su imagen
Este código regula que la ascension que se muestra es correspondiente al nivel
del Servant*/
        if (selectedServant.gameLevel === 3) {
            ascensionFaceImage = selectedServant.extraAssets.faces.ascension[2]; 
        }else if (selectedServant.gameLevel === 4) {
    ascensionFaceImage = selectedServant.extraAssets.faces.ascension[3]; 
        }else if (selectedServant.gameLevel === 5) {
    ascensionFaceImage = selectedServant.extraAssets.faces.ascension[4]; 
        }else {
    ascensionFaceImage = selectedServant.extraAssets.faces.ascension[selectedServant.gameLevel]; 
        }

        //Dependiendo de que sección completaste, la cantidad de QP que te dan
        let qpReward;
        switch(enemy.section){
            case 1:
                qpReward = 500;
                break;
            case 2:
                qpReward = 1000;
                break;
            case 3:
                qpReward = 1500;
                break;
                default:
                    qpReward = 0;
        }
        updateQP(qpReward);

        if(enemy.name === "Altria Alter"){
            Swal.fire({
                title: "Congratulations! You've beaten the game!",
                html: `
                <div class="text-center mb-3">
                    <img class="img-fluid" src="${ascensionFaceImage}" />
                </div>
                <div class="mb-3 border p-3">
                <p>${randomTextFile}</p>
                </div>
                <div class="mb-3 border p-3">
                <p>You have defeated ${enemy.name} and earned ${qpReward}QP! Total QP: ${qp}</p>
                </div>

                
                `,
                icon: "success",
                confirmButtonText: "Return"
            }).then(() => {
                combatArea.innerHTML=``;
                combatArea.style.display="none";
                getBanners();
            });
        }else{
        Swal.fire({
            title: "Victory!",
            html: `
                <div class="text-center mb-3">
                    <img class="img-fluid" src="${ascensionFaceImage}" />
                </div>
                <div class="mb-3 border p-3">
                <p>${randomTextFile}</p>
                </div>
                <div class="mb-3 border p-3">
                <p>You have defeated ${enemy.name} and earned ${qpReward}QP! Total QP: ${qp}</p>
                </div>
                `,
            icon: "success",
            confirmButtonText: "Return"
        }).then(() => {
            combatArea.innerHTML=``;
            combatArea.style.display="none";
            getBanners();
        });
    }
        if(localStorage.getItem(`section${enemy.id}`) !== "true"){
            markCompletedSection(enemy.id);
        }
        logArea.remove();

    };

    //Checkea que el enemigo siga vivo
    const checkEnemyStatus = () => {
        if (enemy.hp <= 0){
            enemy.alive = false;
            logMessage(`${enemy.name} has been defeated!`);
            winGame();
        }
    };
  
    /*Metodo para el ataque especial de Altria Alter, reproduce una linea de voz y una animación con una sweetAlert incluida */
    const altriaNoblePhantasm = () => {
        logMessage(`<strong style="color:red;">Altria Alter uses Excalibur Morgan!</strong>`);
        
        playSpecificVoiceLine(enemies[2].noblePhantasmAudio);
        
        animateExcaliburMorgan();
        showNoblePhantasmAlert("Vortigern, Hammer of the Vile King, reverse the rising sun. Swallow the light, Excalibur Morgan")
        
        //Esto deshabilita los botones para que el usuario no la pueda atacar mientras ejecuta la animación
        isUsingNoblePhantasm = true;

        //Timeout para que se haga la animación
        setTimeout(() => {
        team.forEach(servant =>{
            if(servant.gameAlive){
                const npDamage = 1000;
                servant.gameHp -= npDamage;
                logMessage(`<span style ="color:red;">${servant.name} takes ${npDamage} damage from Excalibur Morgan!</span>`);
                updateStats();
                if(servant.gameHp <= 0){
                    servant.gameAlive = false;
                    logMessage(`<strong style="color:red;">${servant.name} has been defeated by Artoria Alter's Noble Phantasm!</strong>`);
                    playVoiceline(servant, "incapacitated");
                    updateStats();
                }
            }
            
        });

        
        if(team.every(servant => !servant.gameAlive)){
            loseGame();
        }
        isUsingNoblePhantasm = false;
        nextTurn();
    }, 11000);
    
    };

    const resetGame = () => {
        team.forEach((servant) => {
            servant.gameHp = servant.maxHp;
            servant.gameNpAvaialable = true;
            servant.gameAlive = true;
        });
        enemies[0].hp = 3500;
        enemies[0].alive = true;
        enemies[1].hp = 8500;
        enemies[1].alive = true;
        enemies[2].hp = 11500;
        enemies[2].alive = true;
        isGameWon = false;
    };
    
    //Se usa para reproducir el audio de Altria Alter
    const playSpecificVoiceLine = (audioAssets) => {
        if (audioAssets && audioAssets.length > 0) {
            const playAudioSequence = (audioFiles, index = 0) => {
                if (index < audioFiles.length) {
                    const audio = new Audio(audioFiles[index]);
                    audio.play();
                    audio.addEventListener("ended", () => {
                        playAudioSequence(audioFiles, index + 1);
                    });
                }
            };
            playAudioSequence(audioAssets);
        } else {
            console.error("No audio files found for this voice line.");
        }
    };
    //El texto de la api te devuelve el datos que no quiero mostrar en el texto, esta regex los elimina
    const cleanApiText = (text) => {
        return text.replace(/\[.*?\]/g, '').trim();
    };

    /*Metodo para reproducir las voces de los servants, el parametro type decide que tipo de voz se ejecuta
    por ejemplo un type de "attack" va buscar los audioAssets que perteneceN a los audios de ataque
    */
    const playVoiceline = (servant, type) => {

        //Almacena las rutas de los audios
        let selectedLines = [];
        let noblePhantasmText;
        let currentAudio = null;
    
        //Reproduce los audios almacenados en audioFiles
        const playAudioSequence = (audioFiles, index = 0) => {
            if (index < audioFiles.length) {
                currentAudio = new Audio(audioFiles[index]); //El audio en el indice actual
                currentAudio.play();

                currentAudio.addEventListener("ended", () => {
                    //Si estoy en el ultimo audio y el type es attack o noblephantasm
                    if (index + 1 === audioFiles.length && (type.toLowerCase() === "attack" || type.toLowerCase() === "noblephantasm")) {
                        if(isGameWon){
                            playAudioSequence(audioFiles, index + 1);
                            return; //Uso return acá para que no vuelva a pasar por checkEnemyStatus y evitar bugs
                        }
                        checkEnemyStatus();
                        
                    }
                    playAudioSequence(audioFiles, index + 1);
                    
                });
            }
        };
    
        if (type.toLowerCase() === "attack") {
            //Busco en el profile del Servant las voces de tipo battle
            const battleVoicelines = servant.profile.voices.find(voice => voice.type === "battle").voiceLines;
            //De todas las voces, devolveme solo aquellas que tengan la palabra "attack"
            const attackAudioAssets = battleVoicelines
                .filter(line => line.name.toLowerCase().includes("attack"))
                .flatMap(line => line.audioAssets);
    
            if (attackAudioAssets.length > 0) {
                //Numero random entre todas las voces para seleccionar una al azar
                const randomIndex = Math.floor(Math.random() * attackAudioAssets.length);
                const randomAudioFile = attackAudioAssets[randomIndex];
                //Se almacena el audio en selectedLines
                selectedLines = [randomAudioFile];
                console.log("randomAudioFile: " + randomAudioFile);
            }
    
        } else if (type.toLowerCase() === "noblephantasm") {
            const noblePhantasmVoicelines = servant.profile.voices.find(voice => voice.type === "treasureDevice").voiceLines;
            const randomLine = noblePhantasmVoicelines[Math.floor(Math.random() * noblePhantasmVoicelines.length)];
            selectedLines = randomLine.audioAssets;
            noblePhantasmText = randomLine.subtitle;
            noblePhantasmText = cleanApiText(noblePhantasmText);
    
            const title =`${servant.noblePhantasms[0].name} || ${servant.name}`;
    
            Swal.fire({
                title: title,
                html: '<p></p>',
                backdrop: true,
                showConfirmButton: false,
                //Se muestran las palabras letra por letra
                didOpen: () => {
                    const swalText = Swal.getHtmlContainer().querySelector('p');
                    swalText.textContent = "";
                    let index = 0;
    
                    const interval = setInterval(() => {
                        if (index < noblePhantasmText.length) {
                            swalText.textContent += noblePhantasmText[index];
                            index++;
                        } else {
                            clearInterval(interval);
                        }
                    }, 55);
                },
                //Al cerrarse la alerta se para el audio del ataque especial.
                didClose: () => {
                    if (currentAudio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                    }
                    checkEnemyStatus();
                }
            });
    
        } else if (type.toLowerCase() === "victory") {
            const victoryVoiceLines = servant.profile.voices.find(voice => voice.type === "battle").voiceLines;
            const victoryAudioAssets = victoryVoiceLines
                .filter(line => line.name.toLowerCase().includes("victory"))
                .flatMap(line => line.audioAssets);
    
            if (victoryAudioAssets.length > 0) {
                randomIndexGlobal = Math.floor(Math.random() * victoryAudioAssets.length);
                const randomAudioFile = victoryAudioAssets[randomIndexGlobal];
                selectedLines = [randomAudioFile];
            }
    
        } else if (type.toLowerCase() === "incapacitated") {
            const incapacitatedVoicelines = servant.profile.voices.find(voice => voice.type === "battle").voiceLines;
            const incapacitatedAudioAssets = incapacitatedVoicelines
                .filter(line => line.name.toLowerCase().includes("incapacitated"))
                .flatMap(line => line.audioAssets);
    
            if (incapacitatedAudioAssets.length > 0) {
                const randomIndex = Math.floor(Math.random() * incapacitatedAudioAssets.length);
                const randomAudioFile = incapacitatedAudioAssets[randomIndex];
                selectedLines = [randomAudioFile];
            }
    
        } else if (type.toLowerCase() === "summon") {
            const summonVoiceLines = servant.profile.voices[2]?.voiceLines;
            console.log(summonVoiceLines);
            if (summonVoiceLines.length > 0) {
                const randomLine = summonVoiceLines[Math.floor(Math.random() * summonVoiceLines.length)];
                selectedLines = randomLine.audioAssets;
                Swal.fire({
                    title: `${servant.name} has been summoned!`,
                    html: `
                        <div class="text-center mb-3">
                            <img src="${servant.extraAssets.faces.ascension[1]}" class="img-fluid" alt="${servant.name}" />
                        </div>
                        <p>${summonVoiceLines[0]?.subtitle || `${servant.name} has joined your team!`}</p>
                    `,
                    icon: "success",
                    didClose: () => {
                        if (currentAudio) {
                            currentAudio.pause();
                            currentAudio.currentTime = 0;
                        }
                    }
                });
            }
    
        } 
         else if (type.toLowerCase() === "homevoicelines") {
            const homeVoicelines = servant.profile.voices[0].voiceLines;
            let voiceHtml = '';
            //Por cada voz que tenga el servant se crea un nombre de la voz y su texto
            servant.profile.voices[0].voiceLines.forEach((voice, index) => {
                voiceHtml += `
                    <div class="mb-3 border p-3">
                        <strong>${voice.name}</strong>
                        <p>${voice.subtitle}</p>
                        <button class="btn btn-primary mt-2" id="listenButton${index}">Listen</button>
                    </div>
                `;
            });
            //Se crea la alerta donde se pueden escuchar las voces
            Swal.fire({
                title: `${servant.name} - Voice Lines`,
                html: voiceHtml,
                showCloseButton: true,
                showConfirmButton: false,
                didOpen: () => {
                    //Por cada voz que hay se crea un boton que la reproduce
                    homeVoicelines.forEach((voice, index) => {
                        const button = document.querySelector(`#listenButton${index}`);
                        if (button) {
                            button.addEventListener('click', () => {
                                selectedLines = voice.audioAssets;
    
                                if (selectedLines && selectedLines.length > 0) {
                                    playAudioSequence(selectedLines); 
                                } 
    
                            });
                        }
                    });
                },
                //Si se cierra se para el audio
                didClose: () => {
                    if (currentAudio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                    }
                }
            });
        }else if(type.toLowerCase() === "ascension"){
            const ascensionVoiceLines = servant.profile.voices.find(voice => voice.type === "groeth").voiceLines;

            let ascensionLine;
            if(servant.gameLevel === 5){
                ascensionLine = ascensionVoiceLines.find(line => line.condType === "svtCountStop" && line.condValue === 0);
            }else{
                ascensionLine = ascensionVoiceLines.find(line => line.condType === "svtLimit" && line.condValue === servant.gameLevel -1);
            }
            console.log(ascensionLine);
            selectedLines = ascensionLine ?  ascensionLine.audioAssets : null;
            let ascensionText = ascensionLine ? ascensionLine.subtitle : "Your Servant has leveled up!";
            ascensionText = cleanApiText(ascensionText);
            

            let ascensionFaceImage;
             if(servant.gameLevel === 3 ){
                ascensionFaceImage = servant.extraAssets.faces.ascension[2];
            }
            else if(servant.gameLevel === 4 ){
                ascensionFaceImage = servant.extraAssets.faces.ascension[3];
            }
            else if(servant.gameLevel === 5 ){
                ascensionFaceImage = servant.extraAssets.faces.ascension[4];
            } else {
                ascensionFaceImage = servant.extraAssets.faces.ascension[servant.gameLevel];
            }


            Swal.fire({
                title: "Level Up!",
                html: `
                <div class="text-center mb-3">
                    <img src="${ascensionFaceImage}" class="img-fluid" alt="${servant.name}" />
                </div>
                <div class="mb-3 border p-3">
                    <p>${ascensionText}</p>
                </div>
                `,
                icon: "success",
                backdrop: true,
                showConfirmButton: false,
                didOpen: () =>{
                    const swalText = Swal.getHtmlContainer().querySelector('p');
                    swalText.textContent = "";
                    let index = 0;
    
                    const interval = setInterval(() => {
                        if (index < ascensionText.length) {
                            swalText.textContent += ascensionText[index];
                            index++;
                        } else {
                            clearInterval(interval);
                        }
                    }, 55);
                },
                didClose: () => {
                    if (currentAudio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                    }
                }
            });
        }
    
        if (selectedLines && selectedLines.length > 0) {
            playAudioSequence(selectedLines);
        } 
    
    };
    
   
    //Animaciones para las peleas

    const animateEnemyDamage = () => {
        const enemyImage = document.querySelector(".enemy-image");
        anime({
            targets: enemyImage,
            scale: [1,1.1,1],
            translateX: [-10,10,-10, 0],
            easing: "easeInOutQuad",
            duration: 600
        });
    };

    const animateServantAttack = (index) => {
        const servantImage = document.querySelector(`#servant${index} img`);
        anime({
            targets: servantImage,
            translateY: [-30, 0],
            easing: "easeOutQuad",
            duration: 300
        });
    };

    const animateHpChange = (index) => {
        const servantHpText = document.getElementById(`servantHp${index}`)
        anime({
            targets: servantHpText,
            opacity: [0, 1],
            easing: "easeInOutQuad",
            duration: 300
        });
    };

    const animateExcaliburMorgan = () => {
        const altriaImage = document.querySelector(".enemy-img");
        anime({
            targets: altriaImage,
            scale: [1, 1.5, 1],
            opacity: [1, 0.7, 1],
            easing: "easeInOutQuad",
            duration:11000
        });

        const combatArea = document.getElementById("combatArea");
        anime({
            targets: combatArea,
            backgroundColor: ["#ffffff", "#ffcccc", "#ae20c9", "#121313"],
            easing: "easeInOutQuad",
            duration: 11000
        });
    };

    const animateUserNoblePhantasm = (index) => {
        const servantImage = document.querySelector(`#servant${index} img`);
        
         servantImage.style.filter = "brightness(1.5)";
         setTimeout(()=> {
            servantImage.style.filter = "none";
         }, 800);
        
        anime({
            targets: servantImage,
            scale: [
                {value: 1.2, duration: 400},
                {value: 1, duration: 400},
            ],
            translateY: [
                {value: -30, duration: 400, easing: "easeOutCubic"},
                {value: 0, duration: 400, easing:"easeOutCubic"}
            ],
            opacity: [
                {value: 0, duration:200},
                {value: 1, duration:400}
            ],
            easing: "easeOutQuad",
            duration:800
        });
    };
    const showNoblePhantasmAlert = (text) => {
        const title = "Altria Alter || Excalibur Morgan";
    
        Swal.fire({
            title: title,
            html: '<p></p>',
            backdrop: true,
            showConfirmButton: false,
            didOpen: () => {
                const swalText = Swal.getHtmlContainer().querySelector('p');
                swalText.textContent = "";
                let index = 0;
    
                const interval = setInterval(() => {
                    if (index < text.length) {
                        swalText.textContent += text[index];
                        index++;
                    } else {
                        clearInterval(interval);
                    }
                }, 55);
            },
        });
    };
    
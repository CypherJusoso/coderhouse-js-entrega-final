const servantsContainer = document.getElementById("servantsContainer");
const classIconsContainer = document.getElementById("classIconsContainer");
const mainContent = document.getElementById("mainContent");

const saberServants = ["Altria Pendragon", "Okita Souji", "Charlemagne", "Gawain"];
const archerServants =["Emiya", "Gilgamesh", "Minamoto-no-Tametomo", "Atalante"];
const lancerServants = ["Hektor", "Enkidu", "Percival", "Gareth"];
const riderServants = ["Achilles", "Mandricardo", "Kyokutei Bakin", "Taigong Wang"];
const casterServants = ["Merlin", "Chen Gong", "Altria Caster", "Paracelsus von Hohenheim"];
const assassinServants = ["Emiya (Assassin)", "First Hassan", "Li Shuwen", "Gray"];
const berserkerServants = ["Lancelot", "Sen-no-Rikyu"];
const shielderServant = "Mash Kyrielight";

let team = [];

const addServantToTeam = (servant) => {
    if(team.some(s => s.id === servant.id)){
        alert(`${servant.name} ya esta en tu equipo`);
    }
    else if(team.length >=3){
        alert(`Tu equipo esta completo`);
    }
    else if (!team.some(s => s.id === servant.id)){
        team.push(servant);
        alert(`${servant.name} ha sido agregado a tu equipo`);
    }
    console.log("Team actual:", team);

};

document.addEventListener('DOMContentLoaded', () =>{

    loadClassIcons();
    filterServantsByClass("saber")
});



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

const filterServantsByClass = (className) => {
    servantsContainer.innerHTML = "<div class='text-center'>Loading Servants...</div>";
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

    const displayServants = (servants) => {

    servantsContainer.innerHTML ='';
    const servantGrid = document.createElement('div');
    servantGrid.classList.add("row",);

    servants.forEach(servant => {
        const servantCard = document.createElement("div");
        servantCard.classList.add('col-4', 'col-md-3', 'mb-4');
        console.log(servant);

        servantCard.innerHTML = `
        <div class ="stars">${rarityStars(servant.rarity)}</div>
        <div class="card h-100">
            <img src="${servant.extraAssets.charaGraph.ascension[1]}" class="card-img-top servant-size" alt="${servant.name}"/>
            <div class="card-body">
                <h5 class="card-title servant-name">${servant.name}</h5>
                    <span class="dropdown-arrow">▼</span>
                <div class="servant-description" style="display: none;">
                    <p class="card-text">${servant.profile.comments[0].comment}</p> <!-- Mostrar la clase del servant -->
                    <button class="btn btn-primary add-to-team-btn ">Agregar Servant a tu Equipo</button>
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
    });
    servantsContainer.appendChild(servantGrid);
    };
    
    const loadClassIcons =() =>{

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
let userSP = 540;
let userCEI = 87.5;
let activePool = [];

const SQ_METER_TO_ACRE = 0.000247105;

const riskFactors = {
    Clay: { Wheat: -5, Rice: -15, Corn: 5, Sugarcane: -10, Cotton: 0, Mustard: -5, Chickpeas: 10, Cover: -10 },
    Sand: { Wheat: 10, Rice: 40, Corn: 15, Sugarcane: 25, Cotton: 20, Mustard: 15, Chickpeas: -5, Cover: -15 },
    Silt: { Wheat: 0, Rice: 5, Corn: 0, Sugarcane: 0, Cotton: -5, Mustard: 0, Chickpeas: 5, Cover: -10 },
    Loam: { Wheat: -10, Rice: 10, Corn: -5, Sugarcane: -5, Cotton: -10, Mustard: -10, Chickpeas: -10, Cover: -15 },
    Red: { Wheat: 5, Rice: 10, Corn: 0, Sugarcane: 15, Cotton: 5, Mustard: 5, Chickpeas: 0, Cover: 0 },
    Laterite: { Wheat: 15, Rice: 20, Corn: 10, Sugarcane: 20, Cotton: 15, Mustard: 10, Chickpeas: 15, Cover: 5 },
    Saline: { Wheat: 25, Rice: 35, Corn: 30, Sugarcane: 40, Cotton: 30, Mustard: 25, Chickpeas: 35, Cover: 15 },
    Peaty: { Wheat: 5, Rice: -5, Corn: 15, Sugarcane: 5, Cotton: 10, Mustard: 5, Chickpeas: 20, Cover: -15 },
    Drip: -15, Sprinkler: -10, Pivot: -8, Flood: 10, Manual: 5, Rainfed: 25
};

const allCrops = [
    { name: 'Wheat', baseYield: 1400, unit: 'kg/Ac', color: 'color-wheat' },
    { name: 'Rice', baseYield: 1100, unit: 'kg/Ac', color: 'color-rice' },
    { name: 'Corn', baseYield: 1200, unit: 'kg/Ac', color: 'color-corn' },
    { name: 'Sugarcane', baseYield: 32, unit: 'Tons/Ac', color: 'color-sugarcane' },
    { name: 'Cotton', baseYield: 250, unit: 'kg/Ac', color: 'color-cotton' },
    { name: 'Mustard', baseYield: 600, unit: 'kg/Ac', color: 'color-mustard' },
    { name: 'Chickpeas', baseYield: 450, unit: 'kg/Ac', color: 'color-chickpeas' },
    { name: 'Cover', baseYield: 0, unit: 'N/A', color: 'color-cover' }
];

const farmers = [
    { id: 1, name: 'Krishh Singh', cei: 92.1, sp: 1200 },
    { id: 4, name: 'Manav Kumar', cei: 90.5, sp: 1100 }, 
    { id: 'me', name: 'Malay Gill (You)', cei: 87.5, sp: 540 },
    { id: 2, name: 'Kunal Chaudhary', cei: 85.9, sp: 950 },
    { id: 3, name: 'Abhijit', cei: 81.2, sp: 410 }
];

const tasks = [
    { id: 1, title: "Legume Crop Rotation", description: "Implement pulse crops after cereals to fix Nitrogen.", sp: 250, cei: 6.5, completed: false },
    { id: 2, title: "Cash Crop Diversification", description: "Dedicate 20% area to Cotton or Sugarcane.", sp: 300, cei: 8.0, completed: false },
    { id: 3, title: "Soil Nitrogen Audit", description: "Upload lab verified results.", sp: 150, cei: 3.5, completed: false }
];

const lessons = [
    { id: 1, title: "Precision Nitrogen Cycling", cost: 200, unlocked: false, steps: [
        { title: "Soil Analysis", text: "Conduct a baseline NPK soil test before sowing." },
        { title: "Basal Application", text: "Apply 25% of required nitrogen as base dressing." },
        { title: "Top Dressing", text: "Split remaining nitrogen into 3 doses based on growth stages." },
        { title: "Foliar Spray", text: "Use Urea spray during late stages for protein content." }
    ]},
    { id: 2, title: "Water Scarcity Resilience", cost: 400, unlocked: false, steps: [
        { title: "Irrigation Scheduling", text: "Use tensiometers to monitor soil moisture." },
        { title: "Mulching", text: "Apply straw mulch to reduce evaporation by 30%." },
        { title: "Drip Calibration", text: "Set emitter flow to match crop root depth." }
    ]},
    { id: 3, title: "Bio-Fertilizer Chemistry", cost: 700, unlocked: false, steps: [
        { title: "Cultures", text: "Introduce Rhizobium cultures for legume seeds." },
        { title: "Compost Mixing", text: "Balance Carbon/Nitrogen ratio (25:1) in compost pits." },
        { title: "Application Timing", text: "Apply during dusk to preserve microbial life." }
    ]}
];

function switchTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(tabId + '-tab').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    
    if(tabId === 'tasks') renderTasks();
    if(tabId === 'leaderboard') renderLeaderboard();
    if(tabId === 'learning') renderAcademy();
    
    document.getElementById('profile-card').style.display = 'none';
}

function toggleProfileCard() {
    const card = document.getElementById('profile-card');
    card.style.display = (card.style.display === 'block') ? 'none' : 'block';
}

function calculateArea() {
    const l = document.getElementById('fieldLength').value || 0;
    const w = document.getElementById('fieldWidth').value || 0;
    document.getElementById('fieldArea').value = (l * w * SQ_METER_TO_ACRE).toFixed(2);
}

window.visualizeField = function() {
    const area = parseFloat(document.getElementById('fieldArea').value);
    const count = parseInt(document.getElementById('numZones').value) || 4;
    const vis = document.getElementById('fieldVisualization');
    
    if(!vis) return;
    vis.innerHTML = '';
    
    let props = count === 1 ? [100] : (count === 4 ? [40,30,20,10] : Array(count).fill(100/count));
    const crops = [...allCrops].sort(() => Math.random() - 0.5).slice(0, count);
    activePool = crops.map((c, i) => ({ crop: c, pct: props[i], acres: (area * props[i]/100).toFixed(2) }));

    let top = 0;
    activePool.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = `crop-zone ${item.crop.color}`;
        div.style.cssText = `width:100%; height:${item.pct}%; top:${top}%; left:0;`;
        div.innerHTML = `<span>${item.crop.name} (${Math.round(item.pct)}%)</span>`;
        div.onclick = () => updateZoneDisplay(i);
        vis.appendChild(div);
        top += item.pct;
    });
    updateZoneDisplay(0);
}

function updateZoneDisplay(idx) {
    const data = activePool[idx];
    if(!data) return;
    const soil = document.getElementById('soilType').value;
    const irr = document.getElementById('irrigationType').value;
    
    const sFactor = riskFactors[soil][data.crop.name] || 0;
    const iFactor = riskFactors[irr] || 0;
    let totalRisk = data.crop.baseYield === 0 ? 5 : 10 + sFactor + iFactor;
    totalRisk = Math.max(2, Math.min(98, totalRisk));

    let riskLvl = 'Low', riskColor = 'text-green-600', riskBg = 'bg-green-100', riskDesc = 'High suitability for this zone.';
    if (totalRisk > 35) {
        riskLvl = 'High'; riskColor = 'text-red-600'; riskBg = 'bg-red-100'; riskDesc = 'Significant mismatch between crop and conditions.';
    } else if (totalRisk > 15) {
        riskLvl = 'Moderate'; riskColor = 'text-yellow-600'; riskBg = 'bg-yellow-100'; riskDesc = 'Minor stress factors detected in soil/water.';
    }

    let yieldVal = data.crop.baseYield, unit = data.crop.unit;
    if(data.crop.name !== 'Cover') { yieldVal = yieldVal * (1 - (totalRisk/100)); }
    if(unit === 'kg/Ac' && yieldVal >= 1000) { yieldVal = (yieldVal/100).toFixed(1); unit = 'q/Ac'; }
    else { yieldVal = yieldVal.toFixed(1); }

    document.getElementById('zoneData').innerHTML = `
        <h3 class="text-xl font-bold">Zone ${idx+1}: ${data.crop.name}</h3>
        <p class="text-sm text-gray-500 mb-6">${data.acres} Acres Coverage</p>
        <div class="space-y-4">
            <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                <p class="text-[10px] font-black uppercase text-green-800 tracking-widest">Predicted Yield</p>
                <p class="text-3xl font-black text-green-700">${yieldVal} ${unit}</p>
            </div>
            <div class="p-4 ${riskBg} rounded-lg border-l-4 border-current ${riskColor}">
                <div class="flex justify-between items-center">
                    <p class="text-[10px] font-black uppercase tracking-widest">Risk Evaluation</p>
                    <span class="text-xs font-bold uppercase">${riskLvl}</span>
                </div>
                <p class="text-2xl font-black">${totalRisk}%</p>
                <p class="text-xs mt-1 font-medium">${riskDesc}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 text-center">Environmental Context: ${soil} soil / ${irr}</p>
            </div>
        </div>`;
}

function renderTasks() {
    const list = document.getElementById('tasks-list');
    if(!list) return;
    list.innerHTML = tasks.map(t => `
        <div class="glass-card p-6 flex justify-between items-center ${t.completed ? 'opacity-50' : ''}">
            <div>
                <h4 class="font-bold text-lg text-green-800">${t.title}</h4>
                <p class="text-sm text-gray-500">${t.description}</p>
                <div class="flex gap-4 mt-2">
                    <span class="text-xs font-bold text-green-600">+${t.sp} SP</span>
                    <span class="text-xs font-bold text-blue-600">+${t.cei} CEI</span>
                </div>
            </div>
            <button onclick="completeTask(${t.id})" ${t.completed ? 'disabled' : ''} class="bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow hover:bg-green-800 transition">
                ${t.completed ? 'Logged' : 'Complete'}
            </button>
        </div>`).join('');
}

function completeTask(id) {
    const t = tasks.find(x => x.id === id);
    if(t && !t.completed) {
        t.completed = true; userSP += t.sp; userCEI += t.cei;
        updateState(); renderTasks();
    }
}

function renderAcademy() {
    const list = document.getElementById('academy-list');
    if(!list) return;
    list.innerHTML = lessons.map(l => `
        <div class="glass-card p-6 text-center flex flex-col">
            <div class="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-700 mb-4 border border-green-200">
                <i class="fas ${l.unlocked ? 'fa-unlock' : 'fa-lock'}"></i>
            </div>
            <h4 class="font-bold mb-4 text-sm">${l.title}</h4>
            ${l.unlocked ? 
                `<button onclick="enterLesson(${l.id})" class="w-full bg-green-700 text-white py-2 rounded-lg font-bold text-xs uppercase tracking-widest">Enter Roadmap</button>` :
                `<button onclick="unlockLesson(${l.id})" class="w-full bg-amber-500 text-white py-2 rounded-lg font-bold text-xs ${userSP < l.cost ? 'opacity-50' : ''}">Unlock (${l.cost} SP)</button>`}
        </div>`).join('');
}

function unlockLesson(id) {
    const l = lessons.find(x => x.id === id);
    if(l && userSP >= l.cost) {
        userSP -= l.cost; l.unlocked = true;
        updateState(); renderAcademy();
    } else { alert("Insufficient Stewardship Points!"); }
}

function enterLesson(id) {
    const l = lessons.find(x => x.id === id);
    document.getElementById('lessonTitle').innerText = l.title + " Roadmap";
    document.getElementById('lessonSteps').innerHTML = l.steps.map((s, i) => `
        <div class="flex gap-4 text-left">
            <div class="w-8 h-8 rounded-full bg-green-700 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs">${i+1}</div>
            <div>
                <h5 class="font-bold text-gray-800">${s.title}</h5>
                <p class="text-xs text-gray-500 leading-relaxed">${s.text}</p>
            </div>
        </div>`).join('');
    document.getElementById('lessonOverlay').style.display = 'flex';
}

function closeLesson() { document.getElementById('lessonOverlay').style.display = 'none'; }

function updateState() {
    const elements = {
        'sidebar-cei': userCEI.toFixed(1), 'home-cei': userCEI.toFixed(1), 'card-cei': userCEI.toFixed(1),
        'home-sp': userSP, 'card-sp': userSP, 'header-sp': userSP
    };
    for (let id in elements) { if(document.getElementById(id)) document.getElementById(id).innerText = elements[id]; }
    const me = farmers.find(f => f.id === 'me'); if(me) { me.cei = userCEI; me.sp = userSP; }
}

function renderLeaderboard() {
    const body = document.getElementById('leaderboard-body');
    if(!body) return;
    const sorted = [...farmers].sort((a,b) => b.cei - a.cei);
    body.innerHTML = sorted.map((f, i) => `
        <tr class="${f.id === 'me' ? 'bg-yellow-50 font-bold' : 'border-b'}">
            <td class="px-6 py-4 text-sm">${i+1}</td>
            <td class="px-6 py-4 text-sm">${f.name}</td>
            <td class="px-6 py-4 text-sm text-right font-black text-green-700">${f.cei.toFixed(1)}</td>
            <td class="px-6 py-4 text-sm text-right font-bold text-blue-600">${f.sp}</td>
        </tr>`).join('');
}

window.onload = () => { calculateArea(); visualizeField(); updateState(); };
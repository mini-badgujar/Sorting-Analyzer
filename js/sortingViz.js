    // State
    let array = [];
    let isSorting = false;
    let isPaused = false;
    let speed = 30;
    let selectedAlgorithm = null;

    // Elements
    const visualization = document.getElementById('visualization');
    const arrayInput = document.getElementById('arrayInput');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const status = document.getElementById('status');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const bubbleBtn = document.getElementById('bubbleBtn');
    const selectionBtn = document.getElementById('selectionBtn');
    const insertionBtn = document.getElementById('insertionBtn');

    // Initialize
    renderBars();
    arrayInput.value = array.join(',');

    // Event Listeners
    arrayInput.addEventListener('input', function(e) {
      if (!isSorting) {
        const input = e.target.value.trim();
        if (input) {
          const newArray = input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
          if (newArray.length > 0) {
            array = newArray;
            renderBars();
          }
        }
      }
    });

    speedSlider.addEventListener('input', function(e) {
      speed = parseInt(e.target.value);
      speedValue.textContent = speed;
    });

    playBtn.addEventListener('click', async () => {
      if (!selectedAlgorithm) {
        updateStatus('⚠️ Please select an algorithm first!');
        return;
      }
      if (isPaused) {
        isPaused = false;
        updateStatus('▶️ Resumed...');
      } else if (!isSorting) {
        await startSort();
      }
    });

    pauseBtn.addEventListener('click', () => {
      if (isSorting) {
        isPaused = true;
        playBtn.disabled = false;
        updateStatus('⏸️ Paused');
      }
    });

    resetBtn.addEventListener('click', () => {
      isPaused = false;
      isSorting = false;
      const input = arrayInput.value.trim();
      if (input) {
        const newArray = input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (newArray.length > 0) {
          array = newArray;
        }
      }
      renderBars();
      updateStatus('Ready to visualize!');
    });

    bubbleBtn.addEventListener('click', () => selectAlgorithm('bubble', bubbleBtn));
    selectionBtn.addEventListener('click', () => selectAlgorithm('selection', selectionBtn));
    insertionBtn.addEventListener('click', () => selectAlgorithm('insertion', insertionBtn));

    function selectAlgorithm(algo, btn) {
      if (isSorting) return;
      selectedAlgorithm = algo;
      [bubbleBtn, selectionBtn, insertionBtn].forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateStatus(`Selected: ${algo.charAt(0).toUpperCase() + algo.slice(1)} Sort`);
    }

    function renderBars() {
      visualization.innerHTML = '';
      const maxValue = Math.max(...array);
      const maxHeight = 400;
      
      array.forEach((value, index) => {
        const container = document.createElement('div');
        container.className = 'bar-container';
        container.dataset.index = index;
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = (value / maxValue) * maxHeight;
        bar.style.height = height + 'px';
        bar.textContent = value;
        
        container.appendChild(bar);
        visualization.appendChild(container);
      });
    }

    function updateStatus(message) {
      status.textContent = message;
    }

    async function delay() {
      const ms = 2000 - (speed * 18); // Slower speeds with better range
      while (isPaused && isSorting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getBarContainers() {
      return Array.from(document.querySelectorAll('.bar-container'));
    }

    function getBars() {
      return Array.from(document.querySelectorAll('.bar'));
    }

    async function swapBars(i, j) {
      const containers = getBarContainers();
      const bars = getBars();
      
      bars[i].classList.add('swapping');
      bars[j].classList.add('swapping');
      
      // Visual swap with animation
      const tempHeight = bars[i].style.height;
      const tempText = bars[i].textContent;
      
      bars[i].style.height = bars[j].style.height;
      bars[i].textContent = bars[j].textContent;
      bars[j].style.height = tempHeight;
      bars[j].textContent = tempText;
      
      await delay();
      
      bars[i].classList.remove('swapping');
      bars[j].classList.remove('swapping');
      
      // Update array
      [array[i], array[j]] = [array[j], array[i]];
    }

    async function startSort() {
      isSorting = true;
      disableButtons(true);
      
      switch(selectedAlgorithm) {
        case 'bubble':
          await bubbleSort();
          break;
        case 'selection':
          await selectionSort();
          break;
        case 'insertion':
          await insertionSort();
          break;
      }
      
      // Mark all as sorted
      const bars = getBars();
      bars.forEach(bar => {
        bar.classList.remove('comparing', 'pivot');
        bar.classList.add('sorted');
      });
      
      updateStatus('✅ Sorting Complete!');
      isSorting = false;
      disableButtons(false);
    }

    async function bubbleSort() {
      const bars = getBars();
      const n = array.length;
      
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          if (!isSorting) return;
          
          bars[j].classList.add('comparing');
          bars[j + 1].classList.add('comparing');
          updateStatus(`Bubble Sort: Comparing ${array[j]} and ${array[j + 1]}`);
          
          await delay();
          
          if (array[j] > array[j + 1]) {
            updateStatus(`Bubble Sort: Swapping ${array[j]} and ${array[j + 1]}`);
            await swapBars(j, j + 1);
          }
          
          bars[j].classList.remove('comparing');
          bars[j + 1].classList.remove('comparing');
        }
        bars[n - 1 - i].classList.add('sorted');
      }
    }

    async function selectionSort() {
      const bars = getBars();
      const n = array.length;
      
      for (let i = 0; i < n - 1; i++) {
        if (!isSorting) return;
        
        let minIdx = i;
        bars[i].classList.add('pivot');
        
        for (let j = i + 1; j < n; j++) {
          if (!isSorting) return;
          
          bars[j].classList.add('comparing');
          updateStatus(`Selection Sort: Finding minimum from position ${i}`);
          await delay();
          
          if (array[j] < array[minIdx]) {
            if (minIdx !== i) bars[minIdx].classList.remove('comparing');
            minIdx = j;
          } else {
            bars[j].classList.remove('comparing');
          }
        }
        
        if (minIdx !== i) {
          updateStatus(`Selection Sort: Swapping ${array[i]} with ${array[minIdx]}`);
          await swapBars(i, minIdx);
        }
        
        bars[i].classList.remove('pivot', 'comparing');
        bars[minIdx].classList.remove('comparing');
        bars[i].classList.add('sorted');
      }
    }

    async function insertionSort() {
      const bars = getBars();
      const n = array.length;
      
      bars[0].classList.add('sorted');
      
      for (let i = 1; i < n; i++) {
        if (!isSorting) return;
        
        let key = array[i];
        let j = i - 1;
        
        bars[i].classList.add('comparing');
        updateStatus(`Insertion Sort: Inserting ${key} into sorted portion`);
        await delay();
        
        while (j >= 0 && array[j] > key) {
          if (!isSorting) return;
          
          await swapBars(j, j + 1);
          j--;
        }
        
        bars[i].classList.remove('comparing');
        bars[i].classList.add('sorted');
      }
    }

    function disableButtons(disable) {
      bubbleBtn.disabled = disable;
      selectionBtn.disabled = disable;
      insertionBtn.disabled = disable;
      playBtn.disabled = disable;
      resetBtn.disabled = disable;
      arrayInput.disabled = disable;
    }
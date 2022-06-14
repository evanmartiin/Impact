<script setup>
import signal from 'signal-js';
import CustomButton from '@/components/CustomButton.vue'
import anime from 'animejs';
import { onMounted, ref } from 'vue';
import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID
};

const back = initializeApp(firebaseConfig);
const database = getFirestore(back);

const isOutroOn = ref(false);
const isMoving = ref(false);
const step = ref(0);
const scores = ref([]);
const nearScores = ref([]);
const startRank = ref(undefined);
const isWriting = ref(false);

const props = defineProps({
  score: {
    type: Number,
    required: true
  },
})

onMounted(() => {
  signal.on('outro:ending', ending);

  getScores()
  .then((res) => {
    res.forEach((doc) => scores.value.push(doc.data()));
    scores.value.push({ name: '', score: props.score, player: true });
  })
  .then(() => {
    scores.value.sort((a, b) => a.name.localeCompare(b.name));
    scores.value.sort((a, b) => b.score - a.score);

    const playerIndex = scores.value.findIndex((el) => el.player);
    
    const shift = playerIndex === 0 ? 2 :
                  playerIndex === 1 ? 1 :
                  playerIndex === (scores.value.length - 2) ? -1 :
                  playerIndex === (scores.value.length - 1) ? -2 : 0;

    for (let i = 0; i < 5; i++) {
      const offset = i - 2 + shift;
      if (startRank.value === undefined) startRank.value = playerIndex + offset;
      const line = scores.value[playerIndex + offset];
      if (offset === 0) line.name = 'New';
      nearScores.value.push(line);
    }
  })
  .then(setScoreBoard);
})

const anim = (targets, direction, type, callback) => {
  const tl = anime.timeline({});
  const params = {};

  if (type === "elastic") {
    params.easing = 'easeOutElastic(2, 1)';
    params.scale = direction === "in" ? [0, 1] : [1, 0];
    params.translateY = direction === "in" ? [-100, 0] : [0, -100];
    params.duration = 1000;
  } else if (type === "back") {
    params.easing = 'easeOutBack';
    params.opacity = direction === "in" ? [0, 1] : [1, 0];
    params.translateY = direction === "in" ? [100, 0] : [0, 100];
    params.duration = 500;
  }
  params.delay = direction === "in" ? anime.stagger(100) : anime.stagger(100, { direction: "reverse" });
  params.complete = callback ? callback : null;

  tl.add(
    {
      targets,
      opacity: params.opacity,
      scale: params.scale,
      translateY: params.translateY,
      duration: params.duration,
      delay: params.delay,
      easing: params.easing,
      complete: params.complete
    },
    0
  );
}

const UIs = ['.congrat-el', '.scoreboard-el', '.credits-el']

const transition = (outID, outType, inID, inType) => {
  isMoving.value = true;
  anim(UIs[outID], 'out', outType,
  () => {
    step.value = inID;
    anim(UIs[inID], 'in', inType)
  });
  setTimeout(() => isMoving.value = false, 3000);
}

const ending = () => {
  isOutroOn.value = true;
  step.value = 0;
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.congrat-el',
      scale: [0, 1],
      translateY: [-100, 0],
      duration: 1000,
      delay: anime.stagger(100),
      easing: 'easeOutElastic(2, 1)',
    },
    0
  );
  tl.add(
    {
      targets: '.congrat-img',
      opacity: [0, 1],
      translateY: [100, 0],
      duration: 500,
      easing: 'easeOutBack',
    },
    0
  );
  tl.add(
    {
      targets: '.congrat-el',
      scale: [1, 0],
      translateY: [0, -100],
      duration: 1000,
      delay: anime.stagger(100, { direction: "reverse" }),
      easing: 'easeOutBack',
    },
    4000
  );
  tl.add(
    {
      targets: '.congrat-img',
      opacity: [1, 0],
      translateY: [0, 100],
      duration: 500,
      easing: 'easeOutBack',
      complete: () => {
        scoreboardIn();
        signal.emit('outro:scoreboard');
      }
    },
    4000
  );
}

const scoreboardIn = () => {
  isMoving.value = true;
  step.value = 1;
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.scoreboard-el',
      opacity: [0, 1],
      translateY: [100, 0],
      duration: 1000,
      delay: anime.stagger(100),
      easing: 'easeOutBack',
      complete: () => {
        document.getElementById("nameInput").focus();
      }
    },
    0
  );
  tl.add(
    {
      duration: 3000,
      complete: () => {
        isMoving.value = false;
      }
    },
    0
  )
}

const scoreboardOut = () => {
  const tl = anime.timeline({});
  tl.add(
    {
      targets: '.scoreboard-el',
      opacity: [1, 0],
      translateY: [0, 100],
      duration: 1000,
      delay: anime.stagger(100, { direction: "reverse" }),
      easing: 'easeOutBack',
    },
    0
  );
}

async function newScore(name, score) {
  try {
    const docRef = await addDoc(collection(database, "scores"), { name, score });
  } catch (e) {
    console.error("Error adding score: ", e);
  }
}

async function getScores() {
  const query = await getDocs(collection(database, "scores"));
  return query
}

const setScoreBoard = () => {
  const scoreboardDOM = document.getElementById("scoreboard");
  nearScores.value.forEach((player, index) => {
    const divDOM = document.createElement("div");
    divDOM.classList.add("row", "scoreboard-el")
    if (player.player) divDOM.classList.add("active")

    const rank = document.createElement("p");
    rank.innerHTML = startRank.value + index + 1;
    divDOM.appendChild(rank);

    const name = document.createElement("p");
    if (player.player) {
      const input = document.getElementById("nameInput_ex").cloneNode();
      input.id = "nameInput";
      input.style.display = 'block';
      name.appendChild(input);
    } else {
      name.innerHTML = player.name;
    }
    divDOM.appendChild(name);

    const score = document.createElement("p");
    score.innerHTML = player.score;
    divDOM.appendChild(score);

    scoreboardDOM.appendChild(divDOM);
  })

  document.getElementById("nameInput").addEventListener('input', writing);
}

const writing = (e) => {
  isWriting.value = e.target.value.length > 0;
}

const submitName = () => {
  document.getElementById("nameInput").disabled = true;
  isWriting.value = false;
  addDoc(collection(database, "scores"), { name: document.getElementById("nameInput").value, score: props.score });
}
</script>

<template>
<div class="outro" v-show="isOutroOn">
  <div class="outro-ui" v-show="step === 0">
    <div class="congrat">
      <img class="congrat-el" src="/images/end/c.png" alt="Congrat logo C">
      <img class="congrat-el" src="/images/end/o.png" alt="Congrat logo O">
      <img class="congrat-el" src="/images/end/n.png" alt="Congrat logo N">
      <img class="congrat-el" src="/images/end/g.png" alt="Congrat logo G">
      <img class="congrat-el" src="/images/end/r.png" alt="Congrat logo R">
      <img class="congrat-el" src="/images/end/a.png" alt="Congrat logo A">
      <img class="congrat-el" src="/images/end/t.png" alt="Congrat logo T">
    </div>
    <img class="congrat-img" src="/images/end/billy_nuages.png" alt="Billy on clouds">
  </div>

  <div class="outro-ui" v-show="step === 1">
    <h2 class="scoreboard-el">YOUR SCORE</h2>
    <h1 class="scoreboard-el">{{ props.score }}</h1>
    <div id="scoreboard">
      <input type="text" id="nameInput_ex" placeholder="Your name" maxlength="12" style="display: none">
    </div>
    <div class="buttons">
      <CustomButton class="scoreboard-el" :disabled="true">Explore</CustomButton>
      <CustomButton class="scoreboard-el" :click="isWriting ? submitName : null">{{ isWriting ? 'Submit' : 'Restart' }}</CustomButton>
      <CustomButton class="scoreboard-el" :disabled="isMoving" id="credits-btn" :click="() => { signal.emit('outro:credits'); transition(1, 'back', 2, 'back') }">Credits</CustomButton>
    </div>
  </div>

  <div class="outro-ui" v-show="step === 2">
    <h2 class="credits-el" id="credits-title">CREDITS</h2>
    <div id="credits">
      <div class="row credits-el"><p>Ambroise Nicolao</p><p>Designer</p></div>
      <div class="row credits-el"><p>Danut Miculas</p><p>Designer</p></div>
      <div class="row credits-el"><p>Ludwig Pilicer</p><p>Designer</p></div>
      <div class="row credits-el"><p>Evan Martin</p><p>Developer</p></div>
      <div class="row credits-el"><p>Antoine Tardivel</p><p>Developer</p></div>
      <div class="row credits-el"><p>Timon Idrissi</p><p>Composer</p></div>
    </div>
    <CustomButton class="credits-el" :disabled="isMoving" :click="() => { signal.emit('outro:scoreboard'); transition(2, 'back', 1, 'back') }">Back</CustomButton>
  </div>
</div>
</template>

<style scoped lang="scss">
@use "sass:math";

.outro {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .outro-ui {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  // CONGRATS
  .congrat {
    height: 130px;
    margin: 0 2px;

    .congrat-el {

      @for $i from 1 through 7 {
        &:nth-of-type(#{$i}) {
          padding-bottom: #{(math.cos((math.div(calc($i - 1), 3) - 1) * 1.5707)) * 50}px;
        }
      }

      &:nth-of-type(2) {
        margin: 0 0 10px -10px;
      }
      &:nth-of-type(3) {
        margin: 0 0 10px 0;
      }
      &:nth-of-type(4) {
        margin: 0 0 10px 0;
      }
      &:nth-of-type(5) {
        margin: 0 0 10px 10px;
      }
      &:nth-of-type(6) {
        margin: 0 0 5px -5px;
      }
      &:nth-of-type(7) {
        margin: 0 0 10px 5px;
      }
    }
  }

  // SCOREBOARD
  h2 {
    font-size: 30px;
    color: #FAF7F1;
    text-shadow: 
      -1px -1px 0 #0D1C51,  
      1px -1px 0 #0D1C51,
      -1px 1px 0 #0D1C51,
      1px 1px 0 #0D1C51;
  }

  h1 {
    font-size: 100px;
    line-height: 1;
    color: #0D1C51;
    text-shadow: 
      -1px -1px 0 #FAF7F1,  
      1px -1px 0 #FAF7F1,
      -1px 1px 0 #FAF7F1,
      1px 1px 0 #FAF7F1;
  }

  #scoreboard {
    margin: 30px 0;
    
    &:deep(.row) {
      width: 350px;
      display: grid;
      grid-template-columns: 50px 250px 50px;
      margin: 10px 0;
      color: #FAF7F1;

      p {
        text-align: center;

        #nameInput {
          background: none;
          border: none;
          text-align: center;
          color: #FAF7F1;
          width: 250px;

          &:focus {
            outline: none;
          }

          &::placeholder {
            color: #FAF7F1;
            font-style: italic;
          }
        }
      }

      &:not(.active) {
        color: #7b7f90;
      }
    }
  }

  .buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 400px;

    #credits-btn {
      position: absolute;
      right: 5vw;
      bottom: 5vw;
    }
  }

  // CREDITS
  #credits-title {
    margin-top: 30vh;
  }

  #credits {
    margin: 30px 0;
    
    .row {
      width: 350px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 15px 0;

      p {
        color: #FAF7F1;
        text-align: center;
        font-size: 20px;

        &:nth-of-type(1) {
          text-align: right;
        }
        &:nth-of-type(2) {
          text-align: left;
          opacity: .5;
        }
      }
    }
  }
}
</style>
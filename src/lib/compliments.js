const COMPLIMENTS = {
  female: [
    "Knew you'd say yes. You've got great instincts.",
    "Honestly? Best decision you'll make all week.",
    "That smile you're probably making right now — that's the one.",
    "You just made this a much better day.",
    "Good taste runs in the family, clearly.",
    "You're making this far too easy to fall for.",
    "That choice says a lot about you. All good things.",
    "Already looking forward to seeing that face in person.",
  ],
  male: [
    "Solid choice. Confident and decisive — noted.",
    "That's the kind of energy that gets a second date.",
    "You just made this a lot more exciting.",
    "Good instincts. Keep that up.",
    "That's exactly the answer I was hoping for.",
    "Look at you, making great decisions already.",
    "That choice tells me this is going to be a good one.",
    "Already counting down the days because of that.",
  ],
  other: [
    "Knew you'd say yes. Great instincts.",
    "Honestly, best decision you've made all week.",
    "You just made this day a lot better.",
    "Good taste, clearly.",
    "That's exactly the answer I was hoping for.",
    "You're making this very easy to look forward to.",
    "That choice says good things about you.",
    "Already looking forward to seeing you in person.",
  ],
}

export function getRandomCompliment(gender = 'other') {
  const list = COMPLIMENTS[gender] || COMPLIMENTS.other
  return list[Math.floor(Math.random() * list.length)]
}

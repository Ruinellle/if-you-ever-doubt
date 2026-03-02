const dateLine = document.getElementById("dateLine");
const openLetter = document.getElementById("openLetter");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

dateLine.textContent = `Made in Ramadan • ${new Date().toLocaleDateString()}`;

openLetter.addEventListener("click", () => {
  document.getElementById("letter").scrollIntoView({ behavior: "smooth" });
});

const letters = {
  angry: {
    title: "When you’re angry",
    body: `
      I understand why you’re hurt. Not knowing is painful.
      <br/><br/>
      I didn’t keep you outside because you didn’t matter. I kept you outside because I was scared,
      weak, and trying to survive without turning my life into a constant emergency announcement.
      <br/><br/>
      You have the right to feel upset. I just want you to aim it at the situation, not at my intention.
    `
  },
  miss: {
    title: "When you miss me",
    body: `
      Missing you has never been the hard part. The hard part was watching life interrupt us again and again.
      <br/><br/>
      If you miss me today, just know: I do too. Quietly. Constantly. Without drama.
    `
  },
  tired: {
    title: "When you’re tired",
    body: `
      If you’re exhausted from everything, please rest.
      <br/><br/>
      I don’t want to be another burden on your chest. I want to be a soft place, even from far away.
      <br/><br/>
      We can talk slowly, when you’re ready.
    `
  },
  ramadan: {
    title: "Ramadan",
    body: `
      This month is about patience, intention, and mercy.
      <br/><br/>
      If there’s one dua I keep repeating, it’s that Allah brings clarity where there’s confusion,
      and tenderness where there’s hurt.
      <br/><br/>
      Whatever happens between us, I want it to stay halal in the heart: no cruelty, no humiliation, no revenge.
    `
  }
};

document.querySelectorAll(".cap").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-open");
    modalTitle.textContent = letters[key].title;
    modalBody.innerHTML = letters[key].body;
    modal.setAttribute("aria-hidden", "false");
  });
});

closeModal.addEventListener("click", () => {
  modal.setAttribute("aria-hidden", "true");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.setAttribute("aria-hidden", "true");
});

function handleButtonClick(e) {
  const key = e.target.textContent;
  
}

const btns = document.getElementsByClassName("btn");
for (const btn of btns) {
  btn.addEventListener('click', handleButtonClick);
}

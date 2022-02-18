function copytoclipboard() {
  var text = document.querySelector(".copy").getAttribute("id");
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    }
  );
  alert("Link of Your Linktree copied to clipboard. Share it.")
}

const navbar = document.querySelector('nav');

const changeNavbarColor = () =>{
     if(window.scrollY >= 50){
       navbar.style.opacity= 1;
     }
     else{
       navbar.style.opacity= 0;
     }
  };
  window.addEventListener('scroll', changeNavbarColor);

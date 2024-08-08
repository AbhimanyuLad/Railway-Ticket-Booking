



(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })();






function updateDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  document.getElementById('datetime').innerText = `${date} | ${time}`;
}

// Update the date and time immediately and then every second
updateDateTime();
setInterval(updateDateTime, 1000);





function toggleDropdown() {
  document.getElementById("dropdownMenu").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.fa-user')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      for (var i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
              openDropdown.classList.remove('show');
          }
      }
  }
}



const flashMsg = document.getElementById("flashMsg");
flashMsg.style.display = "block";

// Hide the flash message after 5 seconds
setTimeout(() => {
  flashMsg.style.display = "none";
}, 5000);







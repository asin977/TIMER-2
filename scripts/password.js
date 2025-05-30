document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const newPasswordInput = document.querySelectorAll('input')[1]; 
  const rePasswordInput = document.querySelectorAll('input')[2];  
  const saveButton = document.querySelector('.save');

  saveButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const rePassword = rePasswordInput.value.trim();

    if (!username) {
      alert('Please enter a username.');
      return;
    }

    if (!newPassword || !rePassword) {
      alert('Please enter and confirm your new password.');
      return;
    }

    if (newPassword !== rePassword) {
      alert('Passwords do not match. Please re-enter.');
      return;
    }

    
    localStorage.setItem('user_' + username, newPassword);

    alert('Password successfully saved!');

    
    usernameInput.value = '';
    newPasswordInput.value = '';
    rePasswordInput.value = '';
  });
});

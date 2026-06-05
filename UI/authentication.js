window.auth = window.auth || {};

window.auth = {
  async handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      // const response = await fetch('ui/authentication/login/login.php', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      // });
      // const result = await response.json();
      // if (result.success) {
      //   const user = window.User.fromJSON(result.user);
      //   if (user.isValid()) {
      //     window.state.setUser(user);
      //     console.log('Login Successful', window.state.getUser());
      //     alert('Login Successful!');
      //     navigateTo('main_screen');
      //   } else {
      //     alert('Invalid user data');
      //   }
      // } else {
      //   alert('Login Failed: ' + result.message);
      // }
          window.state.setUser({ userId:1, name:"Jade",email:"jadeclegg11@gmail.com",password:"12345"});
          console.log('Login Successful', window.state.getUser());
          alert('Login Successful!');
          navigateTo('main_screen');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  },

  async handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const userId=999;

    try {
      // const response = await fetch('UI/register.php', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      // });
      // const result = await response.json();
      // if (result.success) {
      //   const user = window.User.fromJSON(result.user);
      //   if (user.isValid()) {
      //     state.setUser(user);
      //     console.log('Registration Successful', window.state.getUser());
      //     alert('Registration Successful: ' + window.state.getUser());
      //     navigateTo('main_screen');
      //   } else {
      //     alert('Invalid user data');
      //   }
      // } else {
      //   alert('Registration Failed: ' + result.message);
      // }
      state.setUser(userId, username, email, 1, password);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  },

  logout() {
    state.clearUser();
    window.navigateTo('main_screen');
  }
};

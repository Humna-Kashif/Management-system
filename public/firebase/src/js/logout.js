const logoutButton = document.getElementById('logout');


const auth = firebase.auth();


const logoutFunction = () => {
    //signOut() is a built in firebase function responsible for signing a user out
    auth.signOut()
    .then(() => {
        console.log('User signed out successfully !');
        window.location.assign('./');
    })
    .catch(error => {
        console.error(error);
    });
}

logoutButton.addEventListener('click', logoutFunction);
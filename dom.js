//TODO
//don't have favorites be a filter
//show regular stories when you click "Hack or Snooze" home
//how do you log out? (right now--> manually clear local storage?)

//currentUser is updated in 3 cases:
// 1. user clicks login
// 2. user clicks signup (which calls login)
// 3. page is refreshed while a user is logged in
let currentUser;

//currentStoryList is updated whenever the page is refreshed.
//equal to the storyList retrieved from the API by calling StoryList.getstories()
//If a user is logged in and any of the stories displayed are in the user's favorites, these should already be marked as "favorite"
let currentStoryList;

$(document).ready(function() {
  if (localStorage.getItem('token')) {
    let decryptedToken = JSON.parse(
      atob(localStorage.getItem('token').split('.')[1])
    );
    currentUser = new User(decryptedToken.username);
    currentUser.loginToken = localStorage.getItem('token');
    currentUser.retrieveDetails(resp => console.log(resp));
  }

  displayStoryList();

  //these event listeners should be on the page whether a user is logged in or not
  $('#signup').on('click', () => {
    $('#signup-form').slideToggle();
  });
  $('#submit-signup-button').on('click', signUp);
  $('#login-form').on('submit', login);

  $('#favorites').on('click', () => {
    let favorites = currentUser.favorites;
    //needs to be fixed (shouldn't be a filter that turns on and off, a separate list)
    $('#story-list li:not(.favorites)').toggleClass('li hidden-favorites');
  });
});

function getHostname(url) {
  url = url.replace('https://', '');
  url = url.replace('http://', '');
  url = url.replace('www.', '');
  return url.split('/')[0];
}
function displayStoryList() {
  StoryList.getStories(function(storyList) {
    currentStoryList = storyList;
    for (let i = 0; i < storyList.stories.length; i++) {
      let listItem = $(`<li></li>`);
      let star = $(`<i id=${i} class='far fa-star pr-2'><i>`);
      let smallTag = $(`<small class='pl-2'></small>`);
      listItem.append(star);
      listItem.append(storyList.stories[i].title);
      let url = getHostname(storyList.stories[i].url);
      smallTag.append(url);
      listItem.append(smallTag);
      $('#story-list').append(listItem);

      //this is not working (I checked with story ID's that === true, but wasn't starred)
      //currentStoryList.stories[0].storyId === currentUser.favorites[18].storyId
      //it DOES show already favorited stories on refresh, but not right after user logs in
      //second refresh clears the stars
      if (currentUser) {
        for (let j = 0; j < currentUser.favorites.length; j++) {
          if (
            currentUser.favorites[j].storyId === storyList.stories[i].storyId
          ) {
            star.removeClass('far');
            star.addClass('fas');
          }
        }
      }
    }
    if (currentUser) {
      enableFavorites();
      enableSubmitStory();
      //NEED to REMOVE: can't log in if already logged in --> $('#login-form').on('submit', login);
    }
  });
}
function signUp() {
  event.preventDefault();
  let username = $('#username-input').val();
  let password = $('#password-input').val();
  let name = $('#name-input').val();
  User.create(username, password, name, newUser => {
    currentUser = newUser;
    currentUser.login(resp => {
      localStorage.setItem('token', currentUser.loginToken);
      // localStorage.setItem('currentUser', currentUser);
      currentUser.retrieveDetails(resp => console.log(resp));
    });
  });
  $('#signup-form').trigger('reset');
  $('#signup-form').slideToggle();
}
function login() {
  let username = $('#username').val();
  let password = $('#password').val();
  currentUser = new User(username, password);
  currentUser.login(resp => {
    localStorage.setItem('token', currentUser.loginToken);
    // localStorage.setItem('currentUser', currentUser);
    currentUser.retrieveDetails(resp => console.log(resp));
    enableFavorites();
    enableSubmitStory();
    $('#login-form').trigger('reset');
  });
}
function createStory() {
  event.preventDefault();
  let title = $('#title').val();
  let url = $('#url').val();
  //let username = currentUser.username;
  let author = getHostname(url);
  let dataObject = {
    title,
    url,
    author
  };
  currentStoryList.addStory(currentUser, dataObject, resp => {
    console.log(resp);
  });
  $('#submit-form').trigger('reset');
}

//called if a user is logged in
//sets event listeners on the star icons --> users can click to add/remove story from favorites
//TODO: favorites are stored in user details in API and SHOULD repopulate when user logs in
//it DOES show already favorited stories on refresh, but not right after user logs in
//second refresh clears the stars
function enableFavorites() {
  $('ol').on('click', '.fa-star', function(event) {
    $(event.target).toggleClass('far fas');
    $(event.target)
      .parent()
      .toggleClass('favorites');
  });
  $('ol').on('click', '.far', addFavorite);
  $('ol').on('click', '.fas', removeFavorite);
}

//called if a user is logged in, shows submit form
//only users who are logged in should be able to submit a story (does nothing if not logged in)
function enableSubmitStory() {
  $('#submit-dropdown').on('click', () => {
    $('#submit-form').slideToggle();
  });
  $('#submit-form').on('submit', createStory);
}

function addFavorite(event) {
  let storyId = currentStoryList.stories[event.target.id].storyId;
  currentUser.addFavorite(storyId, resp => {
    console.log(resp);
  });
}
function removeFavorite(event) {
  let storyId = currentStoryList.stories[event.target.id].storyId;
  currentUser.removeFavorite(storyId, resp => {
    console.log(resp);
  });
}

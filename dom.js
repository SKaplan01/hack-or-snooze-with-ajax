//if not logged in, should not be able to favorite a story
//don't have favorites be a filter
//show regular stories when you click

let currentUser;
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
  $('#signup').on('click', () => {
    $('#signup-form').slideToggle();
  });
  $('#submit-signup-button').on('click', signUp);
  $('#login-form').on('submit', login);
  $('#submit-dropdown').on('click', () => {
    $('#submit-form').slideToggle();
  });
  $('#submit-form').on('submit', createStory);
  $('ol').on('click', '.fa-star', function(event) {
    $(event.target).toggleClass('far fas');
    $(event.target)
      .parent()
      .toggleClass('favorites');
  });
  $('ol').on('click', '.far', addFavorite);
  $('ol').on('click', '.fas', removeFavorite);
  $('#favorites').on('click', () => {
    let favorites = currentUser.favorites;
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

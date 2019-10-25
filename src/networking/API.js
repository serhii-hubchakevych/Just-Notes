// API.js
import {AsyncStorage } from 'react-native';

async function registerUserApi(userName, userPassword, userFirstName, userLastName, userPhoneNumber, userEmail) {
    const userData = {
        UserName: userName,
        Password: userPassword,
        FirstName: userFirstName,
        LastName: userLastName,
        PhoneNumber: userPhoneNumber,
        Email: userEmail
    }
    try {
        return fetch('https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Register',
        {
            method: 'POST',
            headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
            },
            body:JSON.stringify(userData)}).then((response) => {
                    alert('Your data has been successfully added!')
                    return true;

                }).catch((error) => {
                    console.log('Register User Api Error -------', error)
                })
            } 
    catch (error) {
                console.log('Register User Api Error -------',error)
            }


}

async function authUserApi(userName, userPassword) {
    const userData = {
        UserName: userName,
        UserPassword: userPassword
    }
    try {
       return fetch('https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Login',
       
        {
            method: 'POST',
            headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    },
            body:JSON.stringify(userData)}).then(response => response.json()).then((response)=>{
                    var serverResponse = response
                        AsyncStorage.setItem('Token', serverResponse)
                        AsyncStorage.setItem('UserName', userData.UserName)
                        AsyncStorage.setItem('UserPassword', userData.UserPassword)
                    return serverResponse;  
                }).catch((error) => {
                    console.log('ERROR IS --------', error)
                })
            } 
    catch (error) {
                console.log(error)
            }

}

async function getUserDataApi(userToken) {
    
    var apiGetUserNotes = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Folder?token=';
        apiGetUserNotes = apiGetUserNotes + userToken;
        
        try {
           return fetch(apiGetUserNotes,
                {
                    method: 'GET',
                    headers: {
                    },
                    body: '',
                }).then(response => response.json()).then((response) => {
                    return response;

                }).catch((error) => {
                    console.log('ERROR IS --------', error)
                })
        }
        catch (error) {
            console.log(error)
        }

}

async function addUserDataApi(userToken, noteTitle, noteText, folderId) {
    var addNoteApi = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Note'

    if(folderId != null){
        addNoteApi = addNoteApi +'/' + folderId + '?token=' + userToken
    }
    else{
        addNoteApi = addNoteApi +'?token=' + userToken
    }
    console.log('API URL', addNoteApi)
    const newNote = {
        Name: noteTitle,
        Content: noteText,
    }
    try {
       return fetch(addNoteApi,
        {
            method: 'POST',
            headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
            },
            body:JSON.stringify(newNote)}).then((response) => {
                    return true;
                }).catch((error) => {
                    console.log('ERROR IS --------', error)
                })
            } 
    catch (error) {
                console.log(error)
            }
}

async function updateUserDataApi(noteId, userToken, noteName, noteContent) {
    var apiUrl = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Note/'

    apiUrl = apiUrl + noteId + '?token='+userToken
    const newNote = {
      Name: noteName,
      Content: noteContent,
    }
    try {
      return fetch(apiUrl,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newNote)
        }).then((response) => {
            return true;
        }).catch((error) => {
          console.log('ERROR IS --------', error)
        })
    }
    catch (error) {
      console.log(error)
    }
}

async function deleteUserDataApi(noteId, userToken) {

    var apiUrl = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Note/'
        apiUrl = apiUrl + noteId +'?token=' + userToken
        try {
            return fetch(apiUrl,
                {
                    method: 'DELETE',
                    headers: {
                    },
                    body: ''
                }).then((response) => {
                    return true;
                }).catch((error) => {
                    console.log('ERROR IS --------', error)
                })
        }
        catch (error) {
            console.log(error)
        }

}

async function addUserFolderApi(userToken, folderName, folderId) {
    
    var addFolderApi = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Folder'
    if(folderId != null){
        addFolderApi = addFolderApi +'/' + folderId + '?token=' + userToken
    }
    else{
        addFolderApi = addFolderApi +'?token=' + userToken
    }
    const newFolder = {
        FolderName: folderName,
    }
  
    try {
       return fetch(addFolderApi,
        {
            method: 'POST',
            headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
            },
            body:JSON.stringify(newFolder)}).then((response) => {
                    return true;
                }).catch((error) => {
                    console.log('ERROR IS --------', error)
                })
            } 
    catch (error) {
                console.log(error)
            }
}

async function deleteUserFolderApi(userToken, folderId) {
    var deleteFolderApi = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Folder/'
    deleteFolderApi = deleteFolderApi + folderId + '?token=' + userToken
    try {
       return fetch(deleteFolderApi,
        {
            method: 'DELETE',
            headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
            },
            body: ''}).then((response) => {
                    return true;
                }).catch((error) => {
                    console.log('ERROR IS --------', error)
                })
            } 
    catch (error) {
                console.log(error)
            }
}

async function editUserFolderApi(userToken, folderName, folderId) {
    var editFolderApi = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Folder/'
    editFolderApi = editFolderApi + folderId + '?token=' + userToken
    const editFolderData = {
        folderName: folderName
    }
    try {
       return fetch(editFolderApi,
        {
            method: 'PUT',
            headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
            },
            body:JSON.stringify(editFolderData)}).then((response) => {
                    return true;
                }).catch((error) => {
                    console.log('ERROR IS --------', error)
                })
            } 
    catch (error) {
                console.log(error)
            }
}

async function getUserDataInFolder(userToken, folderId) {
    var getFolderUserData = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Folder/'
    getFolderUserData = getFolderUserData + folderId + '?token=' + userToken

    try {
       return fetch(getFolderUserData,
        {
            method: 'GET',
            headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
            },
            body:''}).then(response => response.json()).then((response) => {
                    return response;
                }).catch((error) => {
                    console.log('ERROR IS --------', error)
                })
            } 
    catch (error) {
                console.log(error)
            }
}


export {addUserFolderApi};
export {registerUserApi};
export {authUserApi};
export {getUserDataApi};
export {addUserDataApi};
export {updateUserDataApi};
export {deleteUserDataApi};
export {deleteUserFolderApi};
export {editUserFolderApi};
export {getUserDataInFolder};

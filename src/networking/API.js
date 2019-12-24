// API.js
import { AsyncStorage } from 'react-native';

async function registerUserApi(userName, userPassword, userFirstName, userLastName, userPhoneNumber, userEmail) {
    const userData = {
        UserName: userName,
        hashKey: userPassword,
        FirstName: userFirstName,
        LastName: userLastName,
        PhoneNumber: userPhoneNumber,
        Email: userEmail
    }
    console.log(userData)
    try {
        return fetch('https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Register',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            }).then((response) => {
                return true;
            }).catch((error) => {
                alert('Register User Api Error')
                console.log('Register User Api Error', error)
            })
    }
    catch (error) {
        alert('Register User Api Error')
        console.log('Register User Api Error', error)
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
                body: JSON.stringify(userData)
            }).then(response => response.json()).then((response) => {
              
                let asyncStorageTokenAndUsername = {
                    username: userData.UserName,
                    userToken: response[0]
                }
                AsyncStorage.setItem('asyncLoginUserData', JSON.stringify(asyncStorageTokenAndUsername))
                return response;
            }).catch((error) => {
                return undefined;
                console.log('Auth User API error', error)
            })
    }
    catch (error) {
        alert('Auth User API error')
        console.log('Auth User API error', error)
    }

}

async function authAsyncStorageUserApi(userToken) {
    try {
        return fetch('https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Login/' + userToken,

            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body:''
            }).then(response => response.json()).then((response) => {
                AsyncStorage.setItem('asyncLoginToken', response)
                return response;
            }).catch((error) => {
                return undefined;
                console.log('Auth User API error', error)
            })
    }
    catch (error) {
        alert('Auth User API error')
        console.log('Auth User API error', error)
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
                alert('Get User data API error')
                console.log('Get User data API error', error)
            })
    }
    catch (error) {
        alert('Get User data API error')
        console.log('Get User data API error', error)
    }

}

async function addUserDataApi(noteToPushInDatabase) {
    let createNewNoteApi = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Note/'
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    let imageArray = await AsyncStorage.getItem(noteToPushInDatabase.imageArray)
    imageArray = JSON.parse(imageArray)
    if (noteToPushInDatabase.inFolder != null) {
        createNewNoteApi = createNewNoteApi + noteToPushInDatabase.inFolder + '?token=' + asyncLoginUserData.userToken
    } else {
        createNewNoteApi = createNewNoteApi + '?token=' + asyncLoginUserData.userToken
    }
    const newNote = {
        name: noteToPushInDatabase.name,
        content: noteToPushInDatabase.content,
        localId: noteToPushInDatabase.localId,
        imageArray: imageArray
    }

    try {
        return fetch(createNewNoteApi,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNote)
            }).then((response) => {
                console.log(response)
                return true;
            }).catch((error) => {
                alert('Add Note API error')
                console.log('Add Note API error', error)
            })
    }
    catch (error) {
        alert('Add Note API error')
        console.log('Add Note API error', error)
    }
}

async function addUserDataOnSharedScreenApi(userToken, noteTitle, noteText, folderId) {
    var apiUrl = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Access/Create/Note/'
    apiUrl = apiUrl + folderId + '?token=' + userToken
 
 
    const newNote = {
        Name: noteTitle,
        Content: noteText,
    }

    try {
        return fetch(apiUrl,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNote)
            }).then((response) => {
                return true;
            }).catch((error) => {
                alert('Add Note API error')
                console.log('Add Note API error', error)
            })
    }
    catch (error) {
        alert('Add Note API error')
        console.log('Add Note API error', error)
    }
}


async function updateUserDataApi(npushNotesToDatabase) {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    let imageArray = await AsyncStorage.getItem(npushNotesToDatabase.imageArray)
    imageArray = JSON.parse(imageArray)

    let apiUrl = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Note/'

    apiUrl = apiUrl + npushNotesToDatabase.localId + '?token=' + asyncLoginUserData.userToken
    const newNote = {
        name: npushNotesToDatabase.name,
        content: npushNotesToDatabase.content,
        imageArray: imageArray
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
                console.log('RES', response)
                return true;
            }).catch((error) => {
                alert('Update User Note API error')
                console.log('Update User Note API error', error)
            })
    }
    catch (error) {
        alert('Update User Note API error')
        console.log('Update User Note API error', error)
    }
}


async function deleteUserDataApi(noteId) {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    
    var deleteNoteApi = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Note/'
    deleteNoteApi = deleteNoteApi + noteId + '?token=' + asyncLoginUserData.userToken
    try {
        return fetch(deleteNoteApi,
            {
                method: 'DELETE',
                headers: {
                },
                body: ''
            }).then((response) => {
                return true;
            }).catch((error) => {
                alert('Delete User Note API error')
                console.log('Delete User Note API error', error)
            })
    }
    catch (error) {
        alert('Delete User Note API error')
        console.log('Delete User Note API error', error)
    }

}

async function addUserFolderApi(folderToPushInDatabase) {
    let createNewFolderApi = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Folder'
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
  
    createNewFolderApi = createNewFolderApi + '?token=' + asyncLoginUserData.userToken
    
    const newFolder = {
        folderName: folderToPushInDatabase.folderName,
        localId: folderToPushInDatabase.localId
    }

    try {
        return fetch(createNewFolderApi,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newFolder)
            }).then((response) => {
    console.log('RES', response)

                return true;
            }).catch((error) => {
                alert('Add User Folder API error')
                console.log('Add User Folder API error', error)
            })
    }
    catch (error) {
        alert('Add User Folder API error')
        console.log('Add User Folder API error', error)
    }
}

async function deleteUserFolderApi(folderId) {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    let deleteFolderApi = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Folder/'
    deleteFolderApi = deleteFolderApi + folderId + '?token=' + asyncLoginUserData.userToken
    try {
        return fetch(deleteFolderApi,
            {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: ''
            }).then((response) => {
                console.log('RES', response)
                return true;
            }).catch((error) => {
                alert('Delete User Folder API error')
                console.log('Delete User Folder API error', error)
            })
    }
    catch (error) {
        alert('Delete User Folder API error')
        console.log('Delete User Folder API error', error)
    }
}

async function editUserFolderApi(pushFolderNameToDatabase) {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    var editFolderApi = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Folder/'
    editFolderApi = editFolderApi + pushFolderNameToDatabase.localId + '?token=' + asyncLoginUserData.userToken
    const editFolderData = {
        folderName: pushFolderNameToDatabase.folderName
    }
    try {
        return fetch(editFolderApi,
            {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFolderData)
            }).then((response) => {
                console.log('RES', response)
                return true;
            }).catch((error) => {
                alert('Edit User Folder API error')
                console.log('Edit User Folder API error', error)
            })
    }
    catch (error) {
        alert('Edit User Folder API error')
        console.log('Edit User Folder API error', error)
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
                body: ''
            }).then(response => response.json()).then((response) => {
                return response;
            }).catch((error) => {
                alert('Get User Data in Folder API error')
                console.log('Get User Data in Folder API error', error)
            })
    }
    catch (error) {
        alert('Get User Data in Folder API error')
        console.log('Get User Data in Folder API error', error)
    }
}

async function shareUserNoteAccessApi(noteId, sharingEmail, userRole) {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    let shareUserNoteAccess = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Shared/Note/'
    shareUserNoteAccess = shareUserNoteAccess + noteId + '?token=' + asyncLoginUserData.userToken
    const shareNoteAccessData = {
        UserEmail: sharingEmail,
        Role: userRole
    }
    console.log('DATA', shareNoteAccessData)
    console.log('URI', shareUserNoteAccess)
    
    try {
        return fetch(shareUserNoteAccess,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(shareNoteAccessData)
            }).then((response) => {
                console.log('RES', response)
                if(response.status == '200'){
                    return true;
                }else{
                    return false;
                }
            }).catch((error) => {
                alert('Share User Note API error')
                console.log('Share User Note API error', error)
            })
    }
    catch (error) {
        alert('Share User Note API error')
        console.log('Share User Note API error', error)
    }
}

async function shareUserFolderAccessApi(folderId, sharingEmail, userRole) {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    let shareUserFolderAccess = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Shared/Folder/'
    shareUserFolderAccess = shareUserFolderAccess + folderId + '?token=' + asyncLoginUserData.userToken
    const shareFolderAccessData = {
        UserEmail: sharingEmail,
        Role: userRole
    }
    
    try {
        return fetch(shareUserFolderAccess,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(shareFolderAccessData)
            }).then((response) => {
                console.log('RES', response)
                if(response.status == '200'){
                    return true;
                }else{
                    return false;
                }
                
            }).catch((error) => {
                alert('Share User Folder API error')
                console.log('Share User Folder API error', error)
            })
    }
    catch (error) {
        alert('Share User Folder API error')
        console.log('Share User Folder API error', error)
    }
}

async function getSharedFoldersAndNotesAPI(userToken) {
    var getUserFolderAndNotes = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Shared?token='
    getUserFolderAndNotes = getUserFolderAndNotes + userToken
    try {
        return fetch(getUserFolderAndNotes,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: ''}).then(response => response.json()).then((response) => {
                return response;
            }).catch((error) => {
                alert('Get Share User Folder and Note API error')
                console.log('Get Share User Folder and Note API error', error)
            })
    }
    catch (error) {
        alert('Get Share User Folder and Note API error')
        console.log('Get Share User Folder and Note API error', error)
    }
}

async function getSharedDataInFolders(folderId) {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    let getSharedDataInFoldersAPI = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Shared/'
    getSharedDataInFoldersAPI = getSharedDataInFoldersAPI + folderId + '?token=' + asyncLoginUserData.userToken
    try {
        return fetch(getSharedDataInFoldersAPI,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: ''
            }).then(response => response.json()).then((response) => {
                return response;
            }).catch((error) => {
                alert('Get User Data in Folder API error')
                console.log('Get User Data in Folder API error', error)
            })
    }
    catch (error) {
        alert('Get User Data in Folder API error')
        console.log('Get User Data in Folder API error', error)
    }
}

async function syncOfflineData(userNotesAndFolders) {
        let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
        asyncLoginUserData = JSON.parse(asyncLoginUserData);
        var syncOfflineNotes = 'https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Folder/Synchronize?token='
        syncOfflineNotes = syncOfflineNotes + asyncLoginUserData.userToken
        console.log('hhuuuiuihiuhuhiuhi',JSON.stringify(userNotesAndFolders))
        try {
            return fetch(syncOfflineNotes,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify(userNotesAndFolders)
                }).then((response) => {
                    console.log(response)
                    if(response.status == '200'){
                        return true;
                    }else{
                        return false;
                    }
                }).catch((error) => {
                    alert('Sync Offline Data error')
                    console.log('Get User Data in Folder API error', error)
                })
        }
        catch (error) {
            alert('Get User Data in Folder API error')
            console.log('Get User Data in Folder API error', error)
        }   
}


export { addUserFolderApi };
export { registerUserApi };
export { authUserApi };
export { getUserDataApi };
export { addUserDataApi };
export { updateUserDataApi };
export { deleteUserDataApi };
export { deleteUserFolderApi };
export { editUserFolderApi };
export { getUserDataInFolder };
export { shareUserNoteAccessApi };
export { shareUserFolderAccessApi };
export { getSharedFoldersAndNotesAPI };
export { getSharedDataInFolders };
export { addUserDataOnSharedScreenApi };
export { authAsyncStorageUserApi };
export { syncOfflineData };
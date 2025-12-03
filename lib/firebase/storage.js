import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'

// Upload file to Firebase Storage
export const uploadFile = async (file, path) => {
    try {
        const storageRef = ref(storage, path)
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        return { success: true, url: downloadURL }
    } catch (error) {
        console.error('Upload file error:', error)
        return { success: false, error: error.message }
    }
}

// Get file URL
export const getFileURL = async (path) => {
    try {
        const storageRef = ref(storage, path)
        const url = await getDownloadURL(storageRef)
        return { success: true, url }
    } catch (error) {
        console.error('Get file URL error:', error)
        return { success: false, error: error.message }
    }
}

// Delete file
export const deleteFile = async (path) => {
    try {
        const storageRef = ref(storage, path)
        await deleteObject(storageRef)
        return { success: true }
    } catch (error) {
        console.error('Delete file error:', error)
        return { success: false, error: error.message }
    }
}

// Upload profile picture
export const uploadProfilePicture = async (file, userId) => {
    const path = `profile-pictures/${userId}/${Date.now()}_${file.name}`
    return uploadFile(file, path)
}

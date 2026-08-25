import { db, auth } from './firebase-config.js';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    getDoc,
    where,
    increment,
    setDoc,
    arrayUnion,
    arrayRemove
} from "firebase/firestore";

export const dbService = {

    async publishPair(pairData, folderId = null, user = null) {

        const cleanPair = {
            title: pairData.title || "İsimsiz",
            sourceType: pairData.sourceType,
            syncOffset: pairData.syncOffset || 0,
            audioSource: pairData.audioSource || 1,
            video1: {
                src: pairData.video1.rawUrl || pairData.video1.src,
                label: pairData.video1.label,
                provider: pairData.video1.provider || null
            },
            video2: {
                src: pairData.video2.rawUrl || pairData.video2.src,
                label: pairData.video2.label,
                provider: pairData.video2.provider || null
            },
            thumbUrl: pairData.thumbUrl || null,
            createdAt: serverTimestamp(),
            folderId: folderId,
            views: 0,
            likes: 0,
            favorites: 0,
            publisherId: user ? user.uid : null,
            publisherName: user ? (user.displayName || user.email) : null,
            publisherAvatar: null
        };

        const docRef = await addDoc(collection(db, "published_pairs"), cleanPair);
        return docRef.id;
    },

    async getPublicPairs() {
        const q = query(collection(db, "published_pairs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getPublicPairById(id) {
        const docRef = doc(db, "published_pairs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    },

    async getPairsInFolder(folderId) {
        const q = query(collection(db, "published_pairs"), where("folderId", "==", folderId));
        const snapshot = await getDocs(q);
        const pairs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return pairs.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    },

    async verifyOwnership(docId, user, collectionName) {
        if (!user || !user.uid) throw new Error("İşlem için giriş yapmalısınız.");

        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.publisherId === user.uid) {
                return true;
            } else {
                throw new Error("Bu içeriği değiştirme yetkiniz yok.");
            }
        }
        throw new Error("İçerik bulunamadı.");
    },

    async deletePublishedPair(docId, user) {
        const isVerified = await this.verifyOwnership(docId, user, "published_pairs");
        if (isVerified) {
            await deleteDoc(doc(db, "published_pairs", docId));
            return true;
        }
    },

    async createFolder(name, bannerUrl, user) {
        if (!user || !user.uid) throw new Error("Klasör oluşturmak için giriş yapmalısınız.");

        const folderData = {
            name: name,
            bannerUrl: bannerUrl || '',
            createdAt: serverTimestamp(),
            publisherId: user.uid,
            publisherName: user.displayName || user.email
        };
        const docRef = await addDoc(collection(db, "folders"), folderData);
        return docRef.id;
    },

    async getFolders() {
        const q = query(collection(db, "folders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async deleteFolder(folderId, user) {
        const isVerified = await this.verifyOwnership(folderId, user, "folders");
        if (isVerified) {
            await deleteDoc(doc(db, "folders", folderId));
            return true;
        }
    },

    async updateFolder(folderId, name, bannerUrl, user) {
        const isVerified = await this.verifyOwnership(folderId, user, "folders");
        if (isVerified) {
            const updates = { name: name, bannerUrl: bannerUrl || '' };
            await updateDoc(doc(db, "folders", folderId), updates);
            return true;
        }
        throw new Error("Yetkisiz işlem.");
    },

    async cleanupLegacyData() {
        if (!auth.currentUser) throw new Error("Bu işlem için giriş yapmalısınız.");
        const uid = auth.currentUser.uid;
        const collections = ["published_pairs", "folders"];
        let deletedCount = 0;

        for (const collName of collections) {
            const q = query(collection(db, collName), where("publisherId", "==", uid));
            const snapshot = await getDocs(q);
            for (const docSnap of snapshot.docs) {
                await deleteDoc(doc(db, collName, docSnap.id));
                deletedCount++;
            }
        }
        return deletedCount;
    },

    async saveUserProfile(userId, profileData) {
        if (!auth.currentUser || auth.currentUser.uid !== userId) {
            throw new Error("Yetkisiz işlem.");
        }
        await setDoc(doc(db, "users", userId), profileData, { merge: true });
    },

    async getUserProfile(userId) {
        const docSnap = await getDoc(doc(db, "users", userId));
        return docSnap.exists() ? docSnap.data() : null;
    },

    async updateUserDisplayName(userId, newDisplayName) {
        if (!userId || !newDisplayName) {
            throw new Error("User ID ve yeni kullanıcı adı gereklidir.");
        }
        if (!auth.currentUser || auth.currentUser.uid !== userId) {
            throw new Error("Yetkisiz işlem: yalnızca kendi hesabınızı güncelleyebilirsiniz.");
        }

        let updatedCount = 0;

        const pairsQuery = query(collection(db, "published_pairs"), where("publisherId", "==", userId));
        const pairsSnapshot = await getDocs(pairsQuery);
        for (const docSnap of pairsSnapshot.docs) {
            await updateDoc(doc(db, "published_pairs", docSnap.id), { publisherName: newDisplayName });
            updatedCount++;
        }

        const foldersQuery = query(collection(db, "folders"), where("publisherId", "==", userId));
        const foldersSnapshot = await getDocs(foldersQuery);
        for (const docSnap of foldersSnapshot.docs) {
            await updateDoc(doc(db, "folders", docSnap.id), { publisherName: newDisplayName });
            updatedCount++;
        }

        // Also update userName in video_notes
        const notesQuery = query(collection(db, "video_notes"), where("userId", "==", userId));
        const notesSnapshot = await getDocs(notesQuery);
        for (const docSnap of notesSnapshot.docs) {
            await updateDoc(doc(db, "video_notes", docSnap.id), { userName: newDisplayName });
            updatedCount++;
        }

        return updatedCount;
    },

    async updatePublicPair(docId, updates, user) {
        const isVerified = await this.verifyOwnership(docId, user, "published_pairs");
        if (isVerified) {
            const allowed = {};
            if (updates.title !== undefined) allowed.title = updates.title;
            if (updates.thumbUrl !== undefined) allowed.thumbUrl = updates.thumbUrl;
            if (updates.syncOffset !== undefined) allowed.syncOffset = Number(updates.syncOffset);
            if (updates.audioSource !== undefined) allowed.audioSource = Number(updates.audioSource);
            if (updates.folderId !== undefined) allowed.folderId = updates.folderId;
            if (updates.video1Src !== undefined) allowed['video1.src'] = updates.video1Src;
            if (updates.video2Src !== undefined) allowed['video2.src'] = updates.video2Src;
            allowed.updatedAt = serverTimestamp();
            await updateDoc(doc(db, "published_pairs", docId), allowed);
            return true;
        }
    },

    async incrementViews(docId) {
        try {
            await updateDoc(doc(db, "published_pairs", docId), { views: increment(1) });
        } catch (e) {

        }
    },

    async toggleLike(pairId, user) {
        if (!user || !user.uid) throw new Error("Beğenmek için giriş yapmalısınız.");
        const likeDocId = `${user.uid}_${pairId}`;
        const likeRef = doc(db, "likes", likeDocId);
        const likeSnap = await getDoc(likeRef);
        if (likeSnap.exists()) {
            await deleteDoc(likeRef);
            await updateDoc(doc(db, "published_pairs", pairId), { likes: increment(-1) });
            return false;
        } else {
            await setDoc(likeRef, { userId: user.uid, pairId, createdAt: serverTimestamp() });
            await updateDoc(doc(db, "published_pairs", pairId), { likes: increment(1) });
            return true;
        }
    },

    async getUserLiked(pairId, user) {
        if (!user || !user.uid) return false;
        const likeSnap = await getDoc(doc(db, "likes", `${user.uid}_${pairId}`));
        return likeSnap.exists();
    },

    async toggleFavorite(pairId, user) {
        if (!user || !user.uid) throw new Error("Favorilere eklemek için giriş yapmalısınız.");
        const favDocId = `${user.uid}_${pairId}`;
        const favRef = doc(db, "favorites", favDocId);
        const favSnap = await getDoc(favRef);
        const pairRef = doc(db, "published_pairs", pairId);
        if (favSnap.exists()) {
            await deleteDoc(favRef);
            try { await updateDoc(pairRef, { favorites: increment(-1) }); } catch (_) {}
            return false;
        } else {
            await setDoc(favRef, { userId: user.uid, pairId, createdAt: serverTimestamp() });
            try { await updateDoc(pairRef, { favorites: increment(1) }); } catch (_) {}
            return true;
        }
    },

    async getUserFavorited(pairId, user) {
        if (!user || !user.uid) return false;
        const favSnap = await getDoc(doc(db, "favorites", `${user.uid}_${pairId}`));
        return favSnap.exists();
    },

    async getUserFavorites(user) {
        if (!user || !user.uid) return [];
        const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data().pairId);
    },

    async addNote(pairId, timestamp, content, user) {
        if (!user || !user.uid) throw new Error("Not eklemek için giriş yapmalısınız.");
        if (!content || !content.trim()) throw new Error("Not içeriği boş olamaz.");
        const noteData = {
            pairId,
            timestamp: Number(timestamp),
            content: content.trim().substring(0, 300),
            userId: user.uid,
            userName: user.displayName || user.email,
            userAvatar: user.photoURL || null,
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, "notes"), noteData);
        return docRef.id;
    },

    async getNotes(pairId) {
        const q = query(collection(db, "notes"), where("pairId", "==", pairId), orderBy("timestamp", "asc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async updateNote(noteId, content, user) {
        if (!user || !user.uid) throw new Error("Giriş yapmalısınız.");
        const noteRef = doc(db, "notes", noteId);
        const noteSnap = await getDoc(noteRef);
        if (!noteSnap.exists()) throw new Error("Not bulunamadı.");
        if (noteSnap.data().userId !== user.uid) throw new Error("Bu notu düzenleme yetkiniz yok.");
        await updateDoc(noteRef, { content: content.trim().substring(0, 300), updatedAt: serverTimestamp() });
        return true;
    },

    async deleteNote(noteId, user) {
        if (!user || !user.uid) throw new Error("Giriş yapmalısınız.");
        const noteRef = doc(db, "notes", noteId);
        const noteSnap = await getDoc(noteRef);
        if (!noteSnap.exists()) throw new Error("Not bulunamadı.");
        if (noteSnap.data().userId !== user.uid) throw new Error("Bu notu silme yetkiniz yok.");
        await deleteDoc(noteRef);
        return true;
    },

    async updateUserAvatar(userId, avatarIcon) {
        if (!auth.currentUser || auth.currentUser.uid !== userId) {
            throw new Error("Yetkisiz işlem: yalnızca kendi hesabınızı güncelleyebilirsiniz.");
        }
        const pairsQuery = query(collection(db, "published_pairs"), where("publisherId", "==", userId));
        const pairsSnapshot = await getDocs(pairsQuery);
        for (const docSnap of pairsSnapshot.docs) {
            await updateDoc(doc(db, "published_pairs", docSnap.id), { publisherAvatar: avatarIcon });
        }
        const foldersQuery = query(collection(db, "folders"), where("publisherId", "==", userId));
        const foldersSnapshot = await getDocs(foldersQuery);
        for (const docSnap of foldersSnapshot.docs) {
            await updateDoc(doc(db, "folders", docSnap.id), { publisherAvatar: avatarIcon });
        }
        return true;
    },

    async publishPairWithAvatar(pairData, folderId = null, user = null, avatarIcon = null) {
        const cleanPair = {
            title: pairData.title || "İsimsiz",
            sourceType: pairData.sourceType,
            syncOffset: pairData.syncOffset || 0,
            audioSource: pairData.audioSource || 1,
            video1: {
                src: pairData.video1.rawUrl || pairData.video1.src,
                label: pairData.video1.label,
                provider: pairData.video1.provider || null
            },
            video2: {
                src: pairData.video2.rawUrl || pairData.video2.src,
                label: pairData.video2.label,
                provider: pairData.video2.provider || null
            },
            thumbUrl: pairData.thumbUrl || null,
            createdAt: serverTimestamp(),
            folderId: folderId,
            views: 0,
            likes: 0,
            favorites: 0,
            publisherId: user ? user.uid : null,
            publisherName: user ? (user.displayName || user.email) : null,
            publisherAvatar: avatarIcon || null
        };
        const docRef = await addDoc(collection(db, "published_pairs"), cleanPair);
        return docRef.id;
    },

    async getNotesByPairId(pairId) {
        const q = query(
            collection(db, "video_notes"),
            where("pairId", "==", pairId),
            orderBy("time", "asc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async addNote(pairId, time, text, userId, userName, userAvatar) {
        const effectiveUserId = userId || (auth.currentUser && auth.currentUser.uid);
        if (!effectiveUserId) throw new Error("Not yazabilmek için giriş yapmalısınız.");
        const noteData = {
            pairId,
            time: Math.round(time * 10) / 10,
            text: String(text).slice(0, 500),
            userId: effectiveUserId,
            userName: userName || (auth.currentUser && (auth.currentUser.displayName || auth.currentUser.email)) || null,
            userAvatar: userAvatar || null,
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, "video_notes"), noteData);
        return { id: docRef.id, ...noteData };
    },

    async deleteNote(noteId, userId) {
        const noteRef = doc(db, "video_notes", noteId);
        const noteSnap = await getDoc(noteRef);
        if (!noteSnap.exists()) throw new Error("Not bulunamadı.");
        if (noteSnap.data().userId !== userId) throw new Error("Bu notu silme yetkiniz yok.");
        await deleteDoc(noteRef);
    }
};

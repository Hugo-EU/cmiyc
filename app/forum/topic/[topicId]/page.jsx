"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  arrayRemove,
  arrayUnion,
  query,
  orderBy,
} from "firebase/firestore";
import { auth } from "@/app/firebase/config";
import { useParams, useRouter } from "next/navigation";
import AlertHelper from "@/app/helpers/alerts";

const COMMENTS_PER_PAGE = 3;

const TopicPage = () => {
  const { topicId } = useParams();
  const router = useRouter();
  const [topicData, setTopicData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newComment, setNewComment] = useState({});
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState({});
  const [sortBy, setSortBy] = useState("recent");
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState("user");
  const [currentPage, setCurrentPage] = useState({});

  useEffect(() => {
    const fetchTopicAndPosts = async () => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || "user");
          }
        }

        const topicRef = doc(db, "topics", topicId);
        const topicSnap = await getDoc(topicRef);

        if (topicSnap.exists()) {
          setTopicData(topicSnap.data());
        } else {
          console.error("Topic not found");
        }

        fetchPosts();
      } catch (error) {
        console.error("Error fetching topic or posts:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const topicRef = doc(db, "topics", topicId);
        const postsRef = collection(topicRef, "posts");
        const order = sortBy === "recent" ? "timestamp" : "likes";
        const postsQuery = query(postsRef, orderBy(order, "desc"));
        const postsSnap = await getDocs(postsQuery);

        const fetchedPosts = await Promise.all(
          postsSnap.docs.map(async (postDoc) => {
            const postData = postDoc.data();
            const commentsRef = collection(postDoc.ref, "comments");
            const commentsSnap = await getDocs(commentsRef);

            const comments = commentsSnap.docs.map((commentDoc) => ({
              id: commentDoc.id,
              ...commentDoc.data(),
            }));

            return {
              id: postDoc.id,
              ...postData,
              comments,
            };
          })
        );

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchTopicAndPosts();
  }, [topicId, sortBy, user]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Sin fecha";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const handleNewPost = async () => {
    if (!user) {
      AlertHelper.warning("Por favor, inicia sesión para crear un post.");
      router.push("/sign-in");
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      AlertHelper.warning("El título y el contenido del post son obligatorios.");
      return;
    }

    try {
      const topicRef = doc(db, "topics", topicId);
      const postsRef = collection(topicRef, "posts");

      const newPostRef = await addDoc(postsRef, {
        authorId: user.uid,
        authorName: user.displayName || "Anónimo",
        title: newPostTitle,
        content: newPostContent,
        timestamp: new Date(),
        likes: 0,
        likedBy: [],
      });

      setNewPostTitle("");
      setNewPostContent("");
      setShowNewPostForm(false);
      AlertHelper.success("Publicado!");
      setPosts((prevPosts) => [
        {
          id: newPostRef.id,
          authorId: user.uid,
          authorName: user.displayName || "Anónimo",
          title: newPostTitle,
          content: newPostContent,
          timestamp: new Date(),
          likes: 0,
          likedBy: [],
          comments: [],
        },
        ...prevPosts,
      ]);
    } catch (error) {
      console.error("Error creating new post:", error);
    }
  };

  const handleNewComment = async (postId) => {
    if (!user) {
      AlertHelper.warning("Por favor, inicia sesión para comentar.");
      router.push("/sign-in");
      return;
    }

    if (!newComment[postId]?.trim()) return;

    try {
      const postRef = doc(db, "topics", topicId, "posts", postId);
      const commentsRef = collection(postRef, "comments");

      const newCommentRef = await addDoc(commentsRef, {
        authorId: user.uid,
        authorName: user.displayName || "Anónimo",
        content: newComment[postId],
        timestamp: new Date(),
        likes: 0,
        likedBy: [],
      });

      const newCommentData = {
        id: newCommentRef.id,
        authorId: user.uid,
        authorName: user.displayName || "Anónimo",
        content: newComment[postId],
        timestamp: new Date(),
        likes: 0,
        likedBy: [],
      };

      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      setShowCommentForm((prev) => ({ ...prev, [postId]: false }));
      AlertHelper.success("Publicado!");

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newCommentData] }
            : post
        )
      );
    } catch (error) {
      console.error("Error creating new comment:", error);
    }
  };

  const handleLike = async (type, postId, commentId = null, likedBy = []) => {
    if (!user) {
      AlertHelper.warning("Por favor, inicia sesión para dar 'me gusta'.");
      router.push("/sign-in");
      return;
    }

    try {
      const ref = commentId
        ? doc(db, "topics", topicId, "posts", postId, "comments", commentId)
        : doc(db, "topics", topicId, "posts", postId);

      const isLiked = likedBy?.includes(user.uid);
      await updateDoc(ref, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              likes: type === "post" && isLiked ? post.likes - 1 : post.likes + 1,
              likedBy:
                type === "post"
                  ? isLiked
                    ? post.likedBy.filter((id) => id !== user.uid)
                    : [...post.likedBy, user.uid]
                  : post.likedBy,
              comments:
                type === "comment"
                  ? post.comments.map((comment) =>
                    comment.id === commentId
                      ? {
                        ...comment,
                        likes: isLiked ? comment.likes - 1 : comment.likes + 1,
                        likedBy: isLiked
                          ? comment.likedBy.filter((id) => id !== user.uid)
                          : [...comment.likedBy, user.uid],
                      }
                      : comment
                  )
                  : post.comments,
            }
            : post
        )
      );
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePageChange = (postId, pageNumber) => {
    setCurrentPage((prev) => ({
      ...prev,
      [postId]: pageNumber,
    }));
  };

  if (loading) return <p className="text-center text-lg text-gray-300">Cargando...</p>;

  const isRestrictedAndUser = topicData?.restricted && userRole === "user";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-extrabold text-center py-8 text-indigo-500">{topicData?.name}</h1>
      <div className="container mx-auto p-6">
        {!isRestrictedAndUser && (
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => {
                if (!user) {
                  AlertHelper.warning("Por favor, inicia sesión para crear un post.");
                  router.push("/sign-in");
                } else {
                  setShowNewPostForm(!showNewPostForm);
                }
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {showNewPostForm ? "Cancelar" : "Crear Post"}
            </button>
            <select
              className="bg-gray-800 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="recent">Más reciente</option>
              <option value="votes">Más votado</option>
            </select>
          </div>
        )}
        {showNewPostForm && !isRestrictedAndUser && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-md">
            <input
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Título del post..."
              className="w-full p-3 mb-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Contenido del post..."
              className="w-full p-3 mb-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleNewPost}
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Publicar
            </button>
          </div>
        )}

        {posts.map((post) => {
          const totalComments = post.comments.length;
          const postId = post.id;
          const currentPostPage = currentPage[postId] || 1;
          const totalPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);
          const startIndex = (currentPostPage - 1) * COMMENTS_PER_PAGE;
          const currentComments = post.comments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);

          return (
            <div key={postId} className="bg-gray-800 p-4 rounded-lg mb-6 shadow-lg">
              <h2 className="text-2xl font-bold text-indigo-400 mb-2">{post.title}</h2>
              <p className="text-sm text-gray-400 mb-3">
                Por {post.authorName} - {formatTimestamp(post.timestamp)}
              </p>
              <p className="text-lg text-gray-200 mb-4">{post.content}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    if (!user) {
                      AlertHelper.warning("Por favor, inicia sesión para comentar.");
                      router.push("/sign-in");
                    } else {
                      setShowCommentForm((prev) => ({
                        ...prev,
                        [postId]: !prev[postId],
                      }));
                    }
                  }}
                  className="text-sm text-gray-400 hover:text-blue-500 focus:outline-none"
                >
                  Comentar
                </button>
                <button
                  onClick={() => handleLike("post", postId, null, post.likedBy || [])}
                  className="flex items-center text-gray-400 hover:text-red-500 focus:outline-none"
                >
                  👍 <span className="ml-1 text-sm">{post.likes || 0}</span>
                </button>
              </div>
              <div className="mt-6">
                {showCommentForm[postId] && (
                  <div className="mt-4 bg-gray-700 p-4 rounded-md">
                    <textarea
                      value={newComment[postId] || ""}
                      onChange={(e) =>
                        setNewComment((prev) => ({
                          ...prev,
                          [postId]: e.target.value,
                        }))
                      }
                      placeholder="Escribe un comentario..."
                      className="w-full p-3 rounded-md bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleNewComment(postId)}
                      className="bg-green-600 text-white px-4 py-2 mt-3 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                      Publicar Comentario
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-6">
                {currentComments.map((comment) => (
                  <div key={comment.id} className="pl-4 border-l-4 border-gray-600 mb-4">
                    <p className="text-sm text-gray-400 mb-1">
                      {comment.authorName} - {formatTimestamp(comment.timestamp)}
                    </p>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                ))}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(postId, pageNumber)}
                        className={`px-3 py-1 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${pageNumber === currentPostPage
                            ? "bg-blue-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicPage;

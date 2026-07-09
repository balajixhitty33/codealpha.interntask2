// BlinkX - Mobile Social Media Platform

class BlinkX {
  constructor() {
    this.currentUser = null;
    this.users = [];
    this.posts = [];
    this.darkMode = false;
    this.loadData();
    this.initApp();
  }

  // Data Management
  loadData() {
    const savedUsers = localStorage.getItem('blinkx_users');
    const savedPosts = localStorage.getItem('blinkx_posts');
    const savedCurrentUser = localStorage.getItem('blinkx_currentUser');
    const savedDarkMode = localStorage.getItem('blinkx_darkMode');

    this.users = savedUsers ? JSON.parse(savedUsers) : [];
    this.posts = savedPosts ? JSON.parse(savedPosts) : [];
    this.currentUser = savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
    this.darkMode = savedDarkMode ? JSON.parse(savedDarkMode) : false;
    
    if (this.darkMode) {
      document.body.classList.add('dark-theme');
    }
  }

  saveData() {
    localStorage.setItem('blinkx_users', JSON.stringify(this.users));
    localStorage.setItem('blinkx_posts', JSON.stringify(this.posts));
    localStorage.setItem('blinkx_currentUser', JSON.stringify(this.currentUser));
    localStorage.setItem('blinkx_darkMode', JSON.stringify(this.darkMode));
  }

  // Theme Management
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-theme');
    this.saveData();
    this.renderProfilePage();
  }

  // User Management
  register(username, email, password) {
    if (this.users.find(u => u.email === email || u.username === username)) {
      return { success: false, message: 'User already exists' };
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      password,
      bio: '',
      avatar: username.charAt(0).toUpperCase(),
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveData();
    return { success: true, user: newUser };
  }

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }
    this.currentUser = user;
    this.saveData();
    return { success: true, user };
  }

  logout() {
    this.currentUser = null;
    this.saveData();
  }

  updateBio(bio) {
    if (this.currentUser) {
      this.currentUser.bio = bio;
      const user = this.users.find(u => u.id === this.currentUser.id);
      if (user) {
        user.bio = bio;
      }
      this.saveData();
    }
  }

  // Post Management
  createPost(caption, imageData) {
    if (!this.currentUser) return { success: false };

    const newPost = {
      id: Date.now(),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      avatar: this.currentUser.avatar,
      caption,
      image: imageData,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    this.posts.unshift(newPost);
    this.saveData();
    return { success: true, post: newPost };
  }

  deletePost(postId) {
    const postIndex = this.posts.findIndex(p => p.id === postId);
    if (postIndex > -1 && this.posts[postIndex].userId === this.currentUser.id) {
      this.posts.splice(postIndex, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  likePost(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    const index = post.likes.indexOf(this.currentUser.id);
    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(this.currentUser.id);
    }
    this.saveData();
  }

  commentOnPost(postId, text) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    const comment = {
      id: Date.now(),
      userId: this.currentUser.id,
      username: this.currentUser.username,
      text,
      createdAt: new Date().toISOString()
    };

    post.comments.push(comment);
    this.saveData();
    return comment;
  }

  // Follow Management
  followUser(userId) {
    if (!this.currentUser) return;

    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    if (!this.currentUser.following.includes(userId)) {
      this.currentUser.following.push(userId);
      user.followers.push(this.currentUser.id);
      this.saveData();
    }
  }

  unfollowUser(userId) {
    if (!this.currentUser) return;

    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const followingIndex = this.currentUser.following.indexOf(userId);
    const followerIndex = user.followers.indexOf(this.currentUser.id);

    if (followingIndex > -1) {
      this.currentUser.following.splice(followingIndex, 1);
    }
    if (followerIndex > -1) {
      user.followers.splice(followerIndex, 1);
    }
    this.saveData();
  }

  // Get Feed
  getFeed() {
    if (!this.currentUser) return [];

    return this.posts.filter(post => {
      return (
        post.userId === this.currentUser.id ||
        this.currentUser.following.includes(post.userId)
      );
    });
  }

  // Search Users
  searchUsers(query) {
    if (!query.trim()) return [];
    return this.users.filter(u => 
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.id.toString().includes(query)
    ).filter(u => u.id !== this.currentUser.id);
  }

  // Get User
  getUser(userId) {
    return this.users.find(u => u.id === userId);
  }

  // UI Methods
  initApp() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    if (this.currentUser) {
      this.renderMainApp();
    } else {
      this.renderLoginPage();
    }
  }

  renderLoginPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page active" id="loginPage">
        <div class="auth-container">
          <div class="logo">✨ BlinkX</div>
          <form class="auth-form" onsubmit="blinkx.handleLogin(event)">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="loginEmail" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="loginPassword" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
            <div class="auth-link">
              Don't have an account? <a onclick="blinkx.goToRegister()">Register</a>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderRegisterPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page active" id="registerPage">
        <div class="auth-container">
          <div class="logo">✨ BlinkX</div>
          <form class="auth-form" onsubmit="blinkx.handleRegister(event)">
            <div class="form-group">
              <label>Username</label>
              <input type="text" id="registerUsername" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="registerEmail" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="registerPassword" required>
            </div>
            <button type="submit" class="btn btn-primary">Register</button>
            <div class="auth-link">
              Already have an account? <a onclick="blinkx.goToLogin()">Login</a>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderMainApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div id="pages">
        <div class="page active" id="feedPage"></div>
        <div class="page" id="profilePage"></div>
        <div class="page" id="searchPage"></div>
      </div>
      <div id="modals">
        <div class="modal" id="createModal"></div>
        <div class="modal" id="userModal"></div>
        <div class="modal" id="bioModal"></div>
      </div>
      <nav class="navbar">
        <button class="nav-item active" onclick="blinkx.goToFeed()">
          <div class="nav-icon">🏠</div>
          <div>Home</div>
        </button>
        <button class="nav-item" onclick="blinkx.goToSearch()">
          <div class="nav-icon">🔍</div>
          <div>Search</div>
        </button>
        <button class="nav-item" onclick="blinkx.openCreateModal()">
          <div class="nav-icon">➕</div>
          <div>Create</div>
        </button>
        <button class="nav-item" onclick="blinkx.goToProfile()">
          <div class="nav-icon">👤</div>
          <div>Profile</div>
        </button>
      </nav>
    `;

    this.renderFeedPage();
  }

  renderFeedPage() {
    const feedPage = document.getElementById('feedPage');
    const feed = this.getFeed();

    let feedHTML = '<div class="header"><div class="header-title">✨ BlinkX</div></div><div class="feed">';

    if (feed.length === 0) {
      feedHTML += '<div class="empty-state"><div class="empty-state-icon">📸</div><div class="empty-state-text">No posts yet</div></div>';
    } else {
      feed.forEach(post => {
        const isLiked = post.likes.includes(this.currentUser.id);
        const isFollowing = this.currentUser.following.includes(post.userId);
        const isOwnPost = post.userId === this.currentUser.id;

        feedHTML += `
          <div class="post">
            <div class="post-header">
              <div class="post-user" onclick="blinkx.viewUserProfile(${post.userId})" style="cursor: pointer;">
                <div class="post-avatar">${post.avatar}</div>
                <div class="post-user-info">
                  <h3>${post.username}</h3>
                  <p>${this.getTimeAgo(post.createdAt)}</p>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                ${!isOwnPost ? `<button class="follow-btn ${isFollowing ? 'following' : ''}" onclick="blinkx.toggleFollow(${post.userId})">${isFollowing ? 'Following' : 'Follow'}</button>` : ''}
                ${isOwnPost ? `<button class="delete-btn" onclick="blinkx.confirmDeletePost(${post.id})">🗑️</button>` : ''}
              </div>
            </div>
            ${post.image ? `<img src="${post.image}" class="post-image" alt="Post">` : ''}
            <div class="post-caption">${post.caption}</div>
            <div class="post-actions">
              <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="blinkx.likePost(${post.id})">
                <span>${isLiked ? '❤️' : '🤍'}</span>
                <span>${post.likes.length}</span>
              </button>
              <button class="action-btn" onclick="blinkx.focusComment(${post.id})">
                <span>💬</span>
                <span>${post.comments.length}</span>
              </button>
            </div>
            <div class="comments-section">
              ${post.comments.slice(-3).map(c => `
                <div class="comment">
                  <span class="comment-author">${c.username}</span>
                  <div class="comment-text">${c.text}</div>
                </div>
              `).join('')}
            </div>
            <div class="comment-input-group">
              <input type="text" placeholder="Add a comment..." id="commentInput${post.id}" />
              <button onclick="blinkx.addComment(${post.id})">Post</button>
            </div>
          </div>
        `;
      });
    }

    feedHTML += '</div>';
    feedPage.innerHTML = feedHTML;
  }

  renderSearchPage() {
    const searchPage = document.getElementById('searchPage');
    searchPage.innerHTML = `
      <div class="header"><div class="header-title">Search Users</div></div>
      <div class="search-container">
        <input type="text" id="searchInput" placeholder="Search by username or ID..." class="search-input" oninput="blinkx.performSearch()" />
      </div>
      <div class="search-results" id="searchResults"></div>
    `;
  }

  performSearch() {
    const query = document.getElementById('searchInput').value;
    const resultsDiv = document.getElementById('searchResults');
    
    if (!query.trim()) {
      resultsDiv.innerHTML = '';
      return;
    }

    const results = this.searchUsers(query);
    
    if (results.length === 0) {
      resultsDiv.innerHTML = '<div class="no-results">No users found</div>';
      return;
    }

    resultsDiv.innerHTML = results.map(user => {
      const isFollowing = this.currentUser.following.includes(user.id);
      return `
        <div class="search-result-item">
          <div class="search-result-info" onclick="blinkx.viewUserProfile(${user.id})" style="cursor: pointer;">
            <div class="result-avatar">${user.avatar}</div>
            <div>
              <div class="result-username">@${user.username}</div>
              <div class="result-id">ID: ${user.id}</div>
              <div class="result-bio">${user.bio || 'No bio'}</div>
            </div>
          </div>
          <button class="follow-btn ${isFollowing ? 'following' : ''}" onclick="blinkx.toggleFollow(${user.id})">${isFollowing ? 'Following' : 'Follow'}</button>
        </div>
      `;
    }).join('');
  }

  viewUserProfile(userId) {
    const user = this.getUser(userId);
    if (!user) return;

    const userPosts = this.posts.filter(p => p.userId === userId);
    const isFollowing = this.currentUser.following.includes(userId);

    const modal = document.getElementById('userModal');
    modal.innerHTML = `
      <div class="modal-overlay" onclick="blinkx.closeModal('userModal')"></div>
      <div class="modal-content">
        <button class="modal-close" onclick="blinkx.closeModal('userModal')">✕</button>
        <div class="profile-header">
          <div class="profile-photo">${user.avatar}</div>
          <div class="profile-info">
            <div class="profile-username">@${user.username}</div>
            <div class="profile-bio">${user.bio || 'No bio'}</div>
            <div class="profile-stats">
              <div class="profile-stat">
                <div class="profile-stat-number">${userPosts.length}</div>
                <div class="profile-stat-label">Posts</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-number">${user.followers.length}</div>
                <div class="profile-stat-label">Followers</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-number">${user.following.length}</div>
                <div class="profile-stat-label">Following</div>
              </div>
            </div>
            <button class="follow-btn ${isFollowing ? 'following' : ''}" onclick="blinkx.toggleFollow(${userId}); blinkx.viewUserProfile(${userId})">${isFollowing ? 'Following' : 'Follow'}</button>
          </div>
        </div>
        <div class="profile-posts-grid">
          ${userPosts.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📸</div></div>' : ''}
          ${userPosts.map(post => `
            <div class="profile-post">
              ${post.image ? `<img src="${post.image}" alt="Post">` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    modal.classList.add('active');
  }

  renderProfilePage() {
    const profilePage = document.getElementById('profilePage');
    const userPosts = this.posts.filter(p => p.userId === this.currentUser.id);

    const profileHTML = `
      <div class="header">
        <div class="header-title">✨ BlinkX</div>
        <div style="display: flex; gap: 10px;">
          <button class="theme-toggle" onclick="blinkx.toggleDarkMode()">${this.darkMode ? '☀️' : '🌙'}</button>
          <button class="action-btn" onclick="blinkx.logout()" style="margin: 0;">
            <span>🚪</span>
          </button>
        </div>
      </div>
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-photo">${this.currentUser.avatar}</div>
          <div class="profile-info">
            <div class="profile-username">@${this.currentUser.username}</div>
            <div class="profile-bio">${this.currentUser.bio || 'No bio yet'}</div>
            <button class="btn btn-secondary" onclick="blinkx.openBioModal()" style="margin-top: 12px; width: 100%; padding: 8px; font-size: 12px;">Edit Bio</button>
            <div class="profile-stats">
              <div class="profile-stat">
                <div class="profile-stat-number">${userPosts.length}</div>
                <div class="profile-stat-label">Posts</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-number">${this.currentUser.followers.length}</div>
                <div class="profile-stat-label">Followers</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-number">${this.currentUser.following.length}</div>
                <div class="profile-stat-label">Following</div>
              </div>
            </div>
          </div>
        </div>
        <div class="profile-posts-grid">
          ${userPosts.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📸</div></div>' : ''}
          ${userPosts.map(post => `
            <div class="profile-post" style="position: relative;">
              ${post.image ? `<img src="${post.image}" alt="Post">` : ''}
              <div class="post-overlay" onclick="blinkx.confirmDeletePost(${post.id})">🗑️ Delete</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    profilePage.innerHTML = profileHTML;
  }

  renderCreateModal() {
    const modal = document.getElementById('createModal');
    modal.innerHTML = `
      <div class="modal-overlay" onclick="blinkx.closeCreateModal()"></div>
      <div class="modal-content">
        <div class="modal-title">Create Post</div>
        <button class="modal-close" onclick="blinkx.closeCreateModal()">✕</button>
        <form class="create-post-form" onsubmit="blinkx.submitPost(event)">
          <div class="image-upload">
            <label>Upload Image</label>
            <div class="image-preview" id="imagePreview">
              <span>Click to upload</span>
            </div>
            <input type="file" id="imageInput" accept="image/*" onchange="blinkx.previewImage(event)" style="display: none;" />
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('imageInput').click()">Select Image</button>
          </div>
          <div class="form-group">
            <label>Caption</label>
            <textarea id="captionInput" placeholder="Write your caption..." rows="4"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Post</button>
          <button type="button" class="btn btn-secondary" onclick="blinkx.closeCreateModal()">Cancel</button>
        </form>
      </div>
    `;
    modal.classList.add('active');
  }

  renderBioModal() {
    const modal = document.getElementById('bioModal');
    modal.innerHTML = `
      <div class="modal-overlay" onclick="blinkx.closeBioModal()"></div>
      <div class="modal-content">
        <div class="modal-title">Edit Bio</div>
        <button class="modal-close" onclick="blinkx.closeBioModal()">✕</button>
        <div class="form-group">
          <label>Bio (max 150 characters)</label>
          <textarea id="bioInput" placeholder="Write your bio..." rows="4" maxlength="150">${this.currentUser.bio}</textarea>
          <div class="char-count"><span id="charCount">0</span>/150</div>
        </div>
        <button class="btn btn-primary" onclick="blinkx.saveBio()">Save Bio</button>
        <button class="btn btn-secondary" onclick="blinkx.closeBioModal()">Cancel</button>
      </div>
    `;
    modal.classList.add('active');
    
    const bioInput = document.getElementById('bioInput');
    document.getElementById('charCount').textContent = bioInput.value.length;
    bioInput.addEventListener('input', (e) => {
      document.getElementById('charCount').textContent = e.target.value.length;
    });
  }

  // Event Handlers
  handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const result = this.login(email, password);
    if (result.success) {
      this.initApp();
    } else {
      alert(result.message);
    }
  }

  handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const result = this.register(username, email, password);
    if (result.success) {
      alert('Registration successful! Please login.');
      this.goToLogin();
    } else {
      alert(result.message);
    }
  }

  previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      preview.dataset.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  submitPost(event) {
    event.preventDefault();
    const caption = document.getElementById('captionInput').value;
    const imagePreview = document.getElementById('imagePreview');
    const imageData = imagePreview.dataset.image || null;

    const result = this.createPost(caption, imageData);
    if (result.success) {
      this.closeCreateModal();
      this.renderFeedPage();
    }
  }

  addComment(postId) {
    const input = document.getElementById(`commentInput${postId}`);
    const text = input.value.trim();

    if (text) {
      this.commentOnPost(postId, text);
      input.value = '';
      this.renderFeedPage();
    }
  }

  focusComment(postId) {
    const input = document.getElementById(`commentInput${postId}`);
    if (input) input.focus();
  }

  likePost(postId) {
    this.likePost(postId);
    this.renderFeedPage();
  }

  toggleFollow(userId) {
    if (this.currentUser.following.includes(userId)) {
      this.unfollowUser(userId);
    } else {
      this.followUser(userId);
    }
    this.renderFeedPage();
  }

  confirmDeletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
      if (this.deletePost(postId)) {
        this.renderFeedPage();
        this.renderProfilePage();
      }
    }
  }

  saveBio() {
    const bio = document.getElementById('bioInput').value;
    this.updateBio(bio);
    this.closeBioModal();
    this.renderProfilePage();
  }

  // Navigation
  goToFeed() {
    this.switchPage('feedPage');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-item')[0].classList.add('active');
  }

  goToSearch() {
    this.renderSearchPage();
    this.switchPage('searchPage');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-item')[1].classList.add('active');
  }

  goToProfile() {
    this.renderProfilePage();
    this.switchPage('profilePage');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-item')[3].classList.add('active');
  }

  goToLogin() {
    this.renderLoginPage();
  }

  goToRegister() {
    this.renderRegisterPage();
  }

  switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
  }

  openCreateModal() {
    this.renderCreateModal();
  }

  closeCreateModal() {
    document.getElementById('createModal').classList.remove('active');
  }

  openBioModal() {
    this.renderBioModal();
  }

  closeBioModal() {
    document.getElementById('bioModal').classList.remove('active');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.logout();
      this.initApp();
    }
  }

  // Utility
  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
}

// Initialize app
const blinkx = new BlinkX();

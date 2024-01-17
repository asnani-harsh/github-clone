$(document).ready(function() {
    const username = 'asnani-harsh'; // Replace with dynamic username
    let perPage = 10; // Default number of repos per page
    const maxPerPage = 100; // Maximum number of repos per page
    let currentPage = 1; // Current page number
    let totalRepos = 0; // Total number of repos
    let totalPages = 0; // Total number of pages
    let searchQuery = ''; // Search query

    // Fetch user profile data
    fetchUser();

    // Fetch repos data
    fetchRepos();

    // Handle search input change
    $('#searchInput').on('input', function() {
        searchQuery = $(this).val().toLowerCase();
        currentPage = 1; // Reset current page
        fetchRepos(); // Fetch repos with search query
    });

    function fetchUser() {
        const url = `https://api.github.com/users/${username}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                $('#profileImage').attr('src', data.avatar_url);
                $('#username').text(data.login);
                $('#bio').text(data.bio);
            })
            .catch(error => {
                console.error(error);
            });
    }

    // Fetch repos data
    function fetchRepos() {
        const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`;
        $('#loader').show(); // Show loader
        $('#repos').empty(); // Clear repos element
        fetch(url)
            .then(response => {
                // Get total number of repos from response header
                totalRepos = parseInt(response.headers.get('X-Total-Count'));
                // Calculate total number of pages
                totalPages = Math.ceil(totalRepos / perPage);
                return response.json();
            })
            .then(data => {
                $('#loader').hide(); // Hide loader
                const reposElement = $('#repos');
                data.forEach(repo => {
                    // Filter repos by search query
                    if (repo.name.toLowerCase().includes(searchQuery) || repo.description.toLowerCase().includes(searchQuery)) {
                        // Create repo element
                        const repoElement = $('<div></div>');
                        repoElement.addClass('mb-3 p-3 border ');
                        repoElement.html(`
                            <h4>${repo.name}</h4>
                            <p>${repo.description}</p>
                            <!-- Add more repo info here -->
                        `);
                        // Append topics to repo element
                        const topicsElement = $('<div></div>');
                        topicsElement.addClass('mt-2');
                        repo.topics.forEach(topic => {
                            const topicElement = $('<span></span>');
                            topicElement.addClass('topic');
                            topicElement.text(topic);
                            topicsElement.append(topicElement);
                        });
                        repoElement.append(topicsElement);
                        // Append repo element to repos element
                        reposElement.append(repoElement);
                    }
                });
                // Update pagination element
                updatePagination();
            })
            .catch(error => {
                console.error(error);
            });
    }

    // Update pagination element
    function updatePagination() {
        const paginationElement = $('#pagination');
        paginationElement.empty(); // Clear pagination element
        // Create previous button
        const prevButton = $('<button></button>');
        prevButton.addClass('btn btn-primary mr-2');
        prevButton.text('Previous');
        prevButton.prop('disabled', currentPage == 1); // Disable if first page
        prevButton.click(function() {
            currentPage--; // Decrement current page
            fetchRepos(); // Fetch repos
        });
        // Append previous button to pagination element
        paginationElement.append(prevButton);
        // Create next button
        const nextButton = $('<button></button>');
        nextButton.addClass('btn btn-primary ml-2');
        nextButton.text('Next');
        nextButton.prop('disabled', currentPage == totalPages); // Disable if last page
        nextButton.click(function() {
            currentPage++; // Increment current page
            fetchRepos(); // Fetch repos
        });
        // Append next button to pagination element
        paginationElement.append(nextButton);
        // Create per page select
        const perPageSelect = $('<select></select>');
        perPageSelect.addClass('form-control ml-2');
        perPageSelect.css('width', '100px');
        // Create options for per page select
        for (let i = 10; i <= maxPerPage; i += 10) {
            const option = $('<option></option>');
            option.val(i);
            option.text(i);
            option.prop('selected', i == perPage); // Select if current per page
            perPageSelect.append(option);
        }
        // Handle per page select change
        perPageSelect.change(function() {
            perPage = $(this).val(); // Update per page
            currentPage = 1; // Reset current page
            fetchRepos(); // Fetch repos
        });
        // Append per page select to pagination element
        paginationElement.append(perPageSelect);
    }
});

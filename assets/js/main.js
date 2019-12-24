$(document).ready(function() {
    //active tooltip
    $('[data-toggle="tooltip"]').tooltip();

    //for message
    $('.message-bar').on('click', function() {
        const messageWrapper = $('#message-wrapper');
        const messages = $("#message-wrapper .messages");
        const closeMessageBox = $(messageWrapper.find('.close')[0]);
        const toUserId = $(this).data('touserid');
        messageWrapper.addClass('active');
        // Enable pusher logging - don't include this in production
        Pusher.logToConsole = true;

        var pusher = new Pusher('2d930b15cfe94002c0c7', {
        cluster: 'ap1',
        forceTLS: true
        });

        var channel = pusher.subscribe('messenger');
        channel.bind('newMessage', function(data) {
            if (data.userSend==toUserId)
            {
            $.ajax({
                type: 'get',
                url: './async/fetch-conversation.php',
                data: `touserid=${toUserId}`,
                success: function(res) {
                    const data = JSON.parse(res);
                    const messagesResult = data.map(message => {
                        return `<p class="message message-${+message.type === 0 ? 'right' : 'left'}">
                                    <span class="content">${message.content}</span>
                                </p>`
                    });

                    messages.html(messagesResult);

                    //scroll to the last message
                    messages.find('.message:last-child')[0].scrollIntoView();
                }
            });
        }
        });

        closeMessageBox.on('click', function(){
            messageWrapper.removeClass('active');
        });

        $("#message-form").on('submit', function(e) {
            //get input element
            const $input = $(this).find('input[type=text]')[0];

            e.preventDefault();

            if($input.value.trim() === '') {
                return false;
            }

            $.ajax({
                type: 'get',
                url: './async/send-message.php',
                data: `touserid=${toUserId}&content=${$input.value}`,
                success: function(res) {
                    const data = JSON.parse(res);
                    if(data.success === true) {
                        messages.append(`<p class="message message-right">
                                            <span class="content">${$input.value}</span>
                                        </p>`);

                        //reset input
                        $input.value = '';
                        $input.focus();

                        //scroll to the last message
                        messages.find('.message:last-child')[0].scrollIntoView();
                    }
                }
            });

        });

        $.ajax({
            type: 'get',
            url: './async/fetch-conversation.php',
            data: `touserid=${toUserId}`,
            success: function(res) {
                const data = JSON.parse(res);
                const messagesResult = data.map(message => {
                    return `<p class="message message-${+message.type === 0 ? 'right' : 'left'}">
                                <span class="content">${message.content}</span>
                            </p>`
                });

                messages.html(messagesResult);

                //scroll to the last message
                messages.find('.message:last-child')[0].scrollIntoView();
            }
        });
    });

    //for comment
    const $commentButton = $(".btn-comment");
    const $commentForm = $(".comment-form");    

    $commentButton.on('click', function() {
        const parent = $(this).parents('.react-group');
        const sibling = $(parent.siblings('.comment-form')[0]);
        const commentInput = sibling.find('input[type=text]')[0];

        commentInput.focus();
    });

    for(let i = 0, len = $commentForm.length; i < len; i++) {
        const form = $($commentForm[i]);
        form.on('submit', function(e) {            
            const postId = $(this).find('input[type=hidden]')[0].value;
            const commentInput = $(this).find('input[type=text]')[0];
            e.preventDefault();
            
            if(commentInput.value.trim() === '') {
                return false;
            }

            $.ajax({
                type: 'get',
                url: './async/add-comment.php',
                data: `postId=${postId}&content=${commentInput.value}`,
                success: function(res) {
                    const data = JSON.parse(res);
                    const commentParent = $(form.siblings('div.comments')[0]);
                    
                    const html = `<div class="comment d-flex align-items-center mb-3">
                                    <a href="./profile.php?id=${data.id}">
                                        <img class="rounded-circle" style="width:40px;height:40px;"
                                            src="data:image/jpeg;base64,${data.avatarImage}"
                                            alt="${data.displayName}">
                                    </a>
                                    <p class="rounded p-2 mb-0 ml-2" style="background-color: #eee;">
                                        <a href="./profile.php?id=${data.id}"
                                            class="text-success font-weight-bold">${data.displayName}</a>
                                        <span>${commentInput.value}</span>
                                    </p>
                                </div>`;

                    commentParent.append(html);

                    commentInput.value = '';

                    const commentCount = $(form.parent().siblings('.card-body').find('.comment-count')[0]);
                    const commentCountData = commentCount.data('commentcount');

                    if(isNaN(+commentCountData)) {
                        window.location.reload();
                    }

                    const htmlCount = `<span>${((+commentCountData) + 1) + ' bình luận'}</span>`
                    commentCount.data('commentcount', (+commentCountData) + 1);
                    commentCount.html(htmlCount);
                }
            });

            return true;
        });
    }
});
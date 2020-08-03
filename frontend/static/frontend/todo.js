//MAIN
$(function(){

    var userId = document.getElementById("userId").value

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    var activeItem = null
    var list_snapshot = []


    function listFormatter(data){
        {
            var list = data
            var wrapper = document.getElementById('list-wrapper')
            for(var i in list){
                //for clearing previous data
                try{
                    document.getElementById(`data-row-${i}`).remove()
                }catch(err){
                    
                }
                
                
                var titlesection = `<span class="title">${list[i].title}</span>`
                if(list[i].completed == true){
                    var titlesection = `<strike class="title">${list[i].title}</strike>`
                }
                var item = 
                `
                <div id="data-row-${i}" class="task-wrapper flex-wrapper">
                    <div style = "flex:7">
                        ${titlesection}
                    </div>
                    <div style = "flex:1">
                        <button class="btn btn-sm btn-warning edit">Edit</button>
                    </div>
                    <div style = "flex:1">
                        <button class="btn btn-sm btn-danger delete">-</button>
                    </div>
                </div>
                `
                wrapper.innerHTML += item
            }
            //for delete repetiton glitch
            if (list_snapshot.length > list.length){
                for (var i=list.length; i < list_snapshot.length; i++){
                    document.getElementById(`data-row-${i}`).remove()
                }
            }
            list_snapshot = list

            for(var i in list){
                var editBtn = document.getElementsByClassName("edit")[i]
                var delBtn = document.getElementsByClassName("delete")[i]
                var titleBtn = document.getElementsByClassName("title")[i]

                editBtn.addEventListener('click', (function(item){
                    return (function(){
                        editItem(item)
                    })
                })(list[i]))

                delBtn.addEventListener('click', (function(item){
                    return (function(){
                        delItem(item)
                    })
                })(list[i]))

                titleBtn.addEventListener('click', (function(item){
                    return (function(){
                        toggleComplete(item)
                    })
                })(list[i]))
            }
        }
    }


    buildList()
    function buildList(){
        
        // wrapper.innerHTML = ""
        
        var url = `../api/task-list/${userId}/`
        
        fetch(url)
        .then((resp) => resp.json())
        .then(function(data){listFormatter(data)})
    }

    var form = document.getElementById("form-wrapper")
    form.addEventListener('submit', function(e){
        e.preventDefault()
        var url = "../api/task-create/"
        if (activeItem != null){
            var url = `../api/task-update/${activeItem.id}/`
            activeItem = null
        }
        var title = document.getElementById("title").value
        fetch(url, 
            {
                method:'POST',
                headers:{'Content-type':'application/json','X-CSRFToken':csrftoken},
                body:JSON.stringify({'title':title,'user':userId})
            }
            ).then(function(response){
                buildList()
                document.getElementById("form").reset()
            })
    })

    function editItem(item){
        activeItem = item
        document.getElementById('title').value = activeItem.title
    }

    function delItem(item){
        var url = `../api/task-delete/${item.id}/`
        fetch(url, 
            {
                method:'DELETE',
                headers:{'Content-type':'application/json','X-CSRFToken':csrftoken},
                body:JSON.stringify({'title':title})
            }
            ).then(function(response){
                buildList()
            })

    }

    function toggleComplete(item){
        item.completed = !item.completed
        var url = `../api/task-update/${item.id}/`
        var ls = JSON.stringify({'title':item.title, 'completed':item.completed})
        console.log(ls)
         fetch (url,
                {
                    method:'POST',
                    headers:{'Content-type':'application/json','X-CSRFToken':csrftoken},
                    body:JSON.stringify({'title':item.title, 'completed':item.completed, 'user':userId})
                }
                ).then((response) => {
                    buildList()
                })
    }


    $("#search").keyup(function(event){
        query = $(this).val();
        var url = `../api/search?search=${query}`
        fetch(url)
        .then((resp) => resp.json())
        .then(function(data){listFormatter(data)})
    })

})
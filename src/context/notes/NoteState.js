import React,{ useState } from "react";
import NoteContext from "./noteContext";

const NoteState =(props) =>{
    const host = "http://localhost:5500"
    const initialnotes = []

    const[notes,setNotes] = useState(initialnotes)
    
   
    // Get Note
    const getNotes =async ()=>{

        const response = await fetch(`${host}/api/notes/fetchallnotes`,{
            method : 'GET',
            headers : {
                'Content-Type' : 'application/json',
                'auth-token' : localStorage.getItem('token')
            },
        });
        const json = await response.json()
        console.log(json)
        setNotes(json)
    }
   
   
   
    // Add Note
    const addNote =async (title,description,tag)=>{
        // console.log("Adding a new note")

        const response = await fetch(`${host}/api/notes/addnote`,{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
                'auth-token' : localStorage.getItem('token')
            },
            body : JSON.stringify({title,description,tag})
        });

        const note = await response.json()
        
        setNotes(notes.concat(note))
    }


    // Delete Note 
    const deleteNote = async(id)=>{

        const response = await fetch(`${host}/api/notes/deletenote/${id}`,{
            method : 'DELETE',
            headers : {
                'Content-Type' : 'application/json',
                'auth-token' : localStorage.getItem('token')
            },
        });

        // console.log("deleting" + id)
        const newnotes = notes.filter((note)=>{
            return note._id !== id
        })
        setNotes(newnotes)
    }

    
    // Edit Note
    const editNote =async (id,title,description,tag)=>{
        
        const response = await fetch(`${host}/api/notes/updatenote/${id}`,{
            method : 'PUT',
            headers : {
                'Content-Type' : 'application/json',
                'auth-token' : localStorage.getItem('token')
            },
            body : JSON.stringify({title,description,tag})
        });
        const json = response.json();

        let newNotes = JSON.parse(JSON.stringify(notes))
        for (let index = 0; index < newNotes.length; index++) {
            const element = newNotes[index];
            if(element._id === id){
                newNotes[index].title=title;
                newNotes[index].description=description;
                newNotes[index].tag=tag;
                break;
            }

        }
        setNotes(newNotes)
    }



    // const s = {
    //     "name" : "Jenny",
    //     "class" : "Section2"
    // }
    return(
        <NoteContext.Provider value={{notes,addNote,deleteNote,editNote,getNotes}}>
            {props.children}
        </NoteContext.Provider>
    )
}

export default NoteState
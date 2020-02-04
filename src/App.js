import React, { useState, useEffect } from 'react';

// AWS Amplify
	import Amplify, { API, graphqlOperation } from 'aws-amplify';
	import awsmobile from './aws-exports';

	import { withAuthenticator } from 'aws-amplify-react';

// List Notes - GraphQL
	import { listNotes } from './graphql/queries';
	import { createNote, updateNote, deleteNote } from './graphql/mutations';
		
	Amplify.configure( awsmobile );

const App = () => {

	const [ notes, setNotes ] = useState([]);
	const [ note, setNote ] = useState('');
	const [ noteId, setNoteId ] = useState('');
	const [ noteIndex, setNoteIndex ] = useState('');
	const [ deletingId, setDeletingId ] = useState('');

	useEffect(() => {

		handleListNotes()
	}, []);

	const handleListNotes = async () => {

		const { data } = await API.graphql( graphqlOperation( listNotes ) );

		setNotes( data.listNotes.items );
	};

	const hasExistingNote = () => {

		if( noteId ) {

			const isNote = notes.findIndex( note => note.id === noteId) > -1;

			return isNote;
		};

		return false;
	};

	const hasNote = () => {

		if(note.trim()) {
			return true;
		}

		return false;
	};

	const handleUpdateNote = async () => {

		const payload = { id: noteId, note };

		const { data } = await API.graphql( graphqlOperation( updateNote, { input: payload }) );

		const updatedNote = data.updateNote;

		const updatedNotes = [
			...notes.slice(0, noteIndex),
			updatedNote,
			...notes.slice(noteIndex + 1)
		];

		console.log('updatedNotes', updatedNotes)

		setNotes( updatedNotes );

		setNote( "" );

		setNoteId( "" );
	};

	const handleAddNote = async (event) => {

		event.preventDefault();

		if( hasExistingNote() ) {
			// update note

			handleUpdateNote();
		}
		else if( hasNote() ) {
			// add new note

			const payload = { note };
	
			const { data } = await API.graphql( graphqlOperation( createNote, { input: payload }) );
	
			const newNote = data.createNote;
	
			const updatedNotes = [ newNote, ...notes ];
	
			setNotes( updatedNotes );
	
			setNote( "" );	
		}
		
	};

	const handleSetNote = ({ note, id }, index) => {
		
		setNote( note );

		setNoteId( id );
		
		setNoteIndex( index );

	};

	const handleDelete = async (id) => {

		const payload = { id: id };

		setDeletingId( id );

		const { data } = await API.graphql( graphqlOperation( deleteNote, { input: payload }) );

		const deletedNoteId = data.deleteNote.id;

		const deletedNoteIndex = notes.findIndex( note => note.id === deletedNoteId );

		const updatedNotes = [
			...notes.slice(0, deletedNoteIndex),
			...notes.slice(deletedNoteIndex + 1)
		];

		setNotes( updatedNotes );

		setDeletingId( "" );
	};

	return (
		<div className="flex flex-column items-center justify-center bg-washed-red pa3">
			<h1 className="code f2">
				Amplify Notetaker
			</h1>
			{
				/* Note Form */
				<form onSubmit={ handleAddNote } className="mb3">
					<input 
						className="pa2 f4"
						placeholder="Write your note"
						type="text"
						value={ note }
						onChange={ ({ target }) => setNote(target.value) }
					/>
					<button 
						className="pa2 f4" 
						type="submit">

							{ noteId ? "Update" : "Add" }
					</button>
				</form>
			}
			{
				/* Note List */
				notes.map((item, i) => 
					(
						<div className="flex items-center" key={ item.id }>
							<li 
								onClick={ () => handleSetNote(item, i)} className="list pa1 f3"
								style={{ color: deletingId === item.id && 'red' }}>

								{ item.note }
							</li>
							<button onClick={ () => handleDelete( item.id ) } className="bg-transparent bn f4">
								<span>
									&times;
								</span>
							</button>
						</div>
					)
				)
			}
		</div>
	);
};

export default withAuthenticator( App, { includeGreetings: true } );

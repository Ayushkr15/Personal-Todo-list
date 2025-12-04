"use client"
import './TodayView.css';
import React from 'react';
import { useState, useEffect } from 'react';

export default function TodayView() {

    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function fetchData(params) {

            const response = await fetch("http://localhost:4000/notion/today", {
                method: "POST",
            });

            const data = await response.json();

            const todaysTask = data.results.map(page => ({
                id: page.id,
                name: page.properties.Tasks.title[0]?.plain_text || 'undefined',
                completed: page.properties.Done.checkbox
            }));

            setTodos(todaysTask);
            setLoading(false);
        }
        fetchData();
    }, [todos]);

    async function handleChange(id) {
        const currentTask = todos.find(todo => todo.id === id);
        const newCompletionValue = !currentTask.completed;

        const response = await fetch("http://localhost:4000/notion/update-task", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                page_id: id,
                completionValue: newCompletionValue,
            }),
        });

        if (response.ok) {
            setTodos(prev => prev.map(todo =>
                todo.id === id ? { ...todo, completed: newCompletionValue } : todo
            ));
        }
    }



    return (
        <div className="main-container">
            <div className='title-container'>
                <h1 className='title-heading'>Today Tasks</h1>
            </div>
            <div className='tasks-container'>
                {loading ? (
                    <div className='loading'>
                        <p>Loading...</p>
                    </div>
                ) : (
                    todos.length == 0 ?
                        <div className='noData'>
                            <p>No tasks added</p>
                        </div> :
                        <ul>
                            {todos.map(task =>
                                <li className='task-item' key={task.id}>
                                    <input
                                        type='checkbox'
                                        id={`task-${task.id}`}
                                        name={`task-${task.id}`}
                                        className='done-btn'
                                        onChange={() => handleChange(task.id)}
                                        checked={task.completed}
                                    />
                                    <label
                                        htmlFor={`task-${task.id}`}
                                        className='task-name'
                                        style={{
                                            color: task.completed ? "green" : "black",
                                            textDecoration: task.completed ? 'line-through' : 'none'
                                        }}>
                                        {task.name}
                                    </label>
                                </li>
                            )}
                        </ul>
                )}
            </div>
        </div>
    )
}
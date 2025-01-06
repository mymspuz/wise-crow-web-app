import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Header from './components/Header/Header'
import TaskSelectionForm from './components/TaskSelectionForm/TaskSelectionForm'
import TaskCompletionForm from './components/TaskCompletionForm/TaskCompletionForm'
import UsersRightsForm from './components/UsersRightsForm/UsersRightsForm'

function App() {
    return (
        <div className="App">
            <Header />
            <Routes>
                <Route path={'/TaskSelection'} element={<TaskSelectionForm />} />
                <Route path={'/TaskCompletion'} element={<TaskCompletionForm />} />
                <Route path={'/UsersRights'} element={<UsersRightsForm />} />
            </Routes>
        </div>
    )
}

export default App
import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useTelegram } from '../../hooks/useTelegram'
import './UsersRightsForm.css'

interface IRights {
    id: number
    stageName: string
}

interface IUsers {
    [name: string]: {
        isAdmin: boolean
        isActive: boolean
        isChange: boolean
        userName: string
        rights: number[]
    }
}

const UsersRightsForm = () => {
    const { tg } = useTelegram()
    const [search, setSearch] = useSearchParams();
    const paramsRights = search.get('rights')
    const paramsUsers = search.get('users')
    const [rights, setRights] = useState<IRights[]>(paramsRights ? JSON.parse(paramsRights) : [])
    const [users, setUsers] = useState<IUsers>(paramsUsers ? JSON.parse(paramsUsers) : {})
    const [userId, setUserId] = useState<{ id: number, name: string }>({ id: 0, name: 'Выберите пользователя' })
    const [listUsers, setListUsers] = useState<{ id: number, name: string }[]>([{ id: 0, name: 'Выберите пользователя' }])

    const isChecked = (id: number) => {
        return users[userId.id] ? users[userId.id].rights.includes(id) : false
    }

    const isAdminChecked = () => {
        return users[userId.id] ? users[userId.id].isAdmin : false
    }

    const isActiveChecked = () => {
        return users[userId.id] ? users[userId.id].isActive : false
    }

    const onSendData = useCallback(() => {
        tg.sendData(JSON.stringify({ users }))
    }, [users, tg])

    function onChangeUser(e: { target: { value: any } }) {
        const selectUser = listUsers.filter(i => i.id === Number(e.target.value))[0]
        setUserId(selectUser)
    }

    function onChangeRights(e: { target: { id: any, checked: boolean } }) {
        const copyUsers = { ...users }
        if (e.target.checked) {
            copyUsers[userId.id].rights.push(Number(e.target.id))
        } else {
            copyUsers[userId.id].rights = copyUsers[userId.id].rights.filter(r => r !== Number(e.target.id))
        }
        copyUsers[userId.id].isChange = true
        setUsers(copyUsers)
    }

    function onChangeAdmin(e: { target: { checked: boolean } }) {
        const copyUsers = { ...users }
        copyUsers[userId.id].isAdmin = e.target.checked
        copyUsers[userId.id].isChange = true
        setUsers(copyUsers)
    }

    function onChangeActive(e: { target: { checked: boolean } }) {
        const copyUsers = { ...users }
        copyUsers[userId.id].isActive = e.target.checked
        copyUsers[userId.id].isChange = true
        setUsers(copyUsers)
    }

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData)
        return () => {
            tg.offEvent('mainButtonClicked', onSendData)
        }
    }, [onSendData])

    useEffect(() => {
        tg.MainButton.setParams({
            text: 'Отправить данные'
        })
        tg.MainButton.show()
        const temp = paramsUsers ? JSON.parse(paramsUsers) : {}
        const res = [{ id: 0, name: 'Выберите пользователя' }]
        Object.keys(temp).map(i => ({ id: Number(i), name: temp[i].userName })).forEach(t => res.push(t))
        setListUsers(res)
    }, [])

    return (
        <div className={"form"}>
            <select value={userId.id} onChange={onChangeUser} className={'select'}>
                {listUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                ))}
            </select>
            <hr/>
            {userId.id !== 0
                ?
                <>
                    <p>
                        <input type='checkbox' checked={isAdminChecked()} onChange={onChangeAdmin}/>Сделать Админом
                    </p>
                    <p>
                        <input type='checkbox' checked={isActiveChecked()} onChange={onChangeActive}/>Сделать активным
                    </p>
                    <p>
                        {rights.map(r => (
                            <p>
                                <input key={r.id} id={`${r.id}`} type='checkbox' checked={isChecked(r.id)} onChange={onChangeRights}/>{r.stageName}
                            </p>
                        ))}
                    </p>
                </>
                :
                <p>
                    Выберите пользователя
                </p>
            }

        </div>
    )
}

export default UsersRightsForm

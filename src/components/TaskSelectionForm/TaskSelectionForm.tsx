import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'

import { useTelegram } from '../../hooks/useTelegram'
import './TaskSelectionForm.css'

interface ITask {
    id: number
    assortName: string
    stageName: string
    needTo: number
    price: number
    remote: number
}

interface IResponseTask {
    status: boolean
    error: string
    tasks: ITask[]
}

const TaskSelectionForm = () => {
    const [taskId, setTaskId] = useState<string>('0')
    const [taskRemoteIds, setTaskRemoteIds] = useState<number[]>([])
    const { tg } = useTelegram()
    const [search, setSearch] = useSearchParams()
    const userId = search.get('userId')
    const [listTasks, setListTasks] = useState<{ id: string, content: string }[]>([])
    const [listTasksRemote, setListTasksRemote] = useState<{ id: string, content: string }[]>([])
    const [error, setError] = useState<{ status: boolean, msg: string }>({ status: true, msg: 'Получение данных' })

    const checkData = (): boolean => {
        return Number(taskId) > 0 || taskRemoteIds.length > 0
    }

    function onChangeTasks(e: { target: { value: any } }) {
        setTaskId(e.target.value)
    }

    function onChangeRemoteTasks(e: { target: { id: any, checked: boolean } }) {
        if (e.target.checked) {
            setTaskRemoteIds([...taskRemoteIds, e.target.id])
        } else {
            setTaskRemoteIds(taskRemoteIds.filter(r => r !== e.target.id))
        }
    }

    const onSendData = useCallback(() => {
        tg.sendData(JSON.stringify({ task: taskId, tasksRemote: taskRemoteIds }))
    }, [taskId, taskRemoteIds])

    useEffect(() => {
        tg.MainButton.setParams({
            text: 'Отправить данные'
        })
        axios.get<IResponseTask>(`https://195.68.140.114:3001/tasks/${userId}`)
            .then((response) => {
                if (response.status === 200) {
                    const tasks: { id: string, content: string }[] = [{ id: '0', content: 'Выберите задачу' }]
                    const tasksRemote: { id: string, content: string }[] = []
                    response.data.tasks.forEach(t => {
                        const temp = { id: `${t.id}`, content: `${t.assortName} [${t.stageName}] ${t.needTo} шт. ${t.price} руб.` }
                        t.remote === 1 ? tasksRemote.push(temp) : tasks.push(temp)
                    })
                    setListTasks(tasks)
                    setListTasksRemote(tasksRemote)
                    setError({ status: false, msg: '' })
                } else {
                    setError({ status: false, msg: response.data.error ? response.data.error : response.statusText })
                }
            })
            .catch((error) => {
                setError({ status: true, msg: error.message })
            })
    }, [])

    useEffect(() => {
        if (!checkData()) {
            tg.MainButton.hide()
        } else {
            tg.MainButton.show()
        }
    }, [taskId, taskRemoteIds])

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData)
        return () => {
            tg.offEvent('mainButtonClicked', onSendData)
        }
    }, [onSendData])

    return (
        <div className={"form"}>
            {error.status
                ?
                <h3>{error.msg}</h3>
                :
                <>
                    <select value={taskId} onChange={onChangeTasks} className={'select'}>
                        {listTasks.map(task => (
                            <option key={task.id} value={task.id}>{task.content}</option>
                        ))}
                    </select>
                    <hr/>
                    <div>
                        {listTasksRemote.map(task => (
                            <p key={task.id}>
                                <input key={task.id} id={task.id} type='checkbox' defaultChecked={false}
                                       onChange={onChangeRemoteTasks}/>{task.content}
                            </p>
                        ))}
                    </div>
                </>
            }
        </div>
    )
}

export default TaskSelectionForm
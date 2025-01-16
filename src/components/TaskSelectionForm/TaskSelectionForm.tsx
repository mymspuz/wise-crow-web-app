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
    const [stageId, setStageId] = useState<{ id: string, name: string }>({ id: '0', name: 'Выбранные задачи' })
    const [taskIds, setTaskIds] = useState<number[]>([])
    const { tg } = useTelegram()
    const [search, setSearch] = useSearchParams()
    const userId = search.get('userId')
    const localTaskId = search.get('tasks')
    const [listTasks, setListTasks] = useState<{ id: string, content: string }[]>([])
    const [listTasksRemote, setListTasksRemote] = useState<{ id: string, content: string }[]>([])
    const [listStage, setListStage] = useState<{ id: string, content: string }[]>([])
    const [error, setError] = useState<{ status: boolean, msg: string }>({ status: true, msg: 'Получение данных' })

    const localTasks: ITask[] = require('../../data/tasks.json')

    const checkData = (): boolean => {
        return taskIds.length > 0
    }

    function onChangeStages(e: { target: { value: any } }) {
        const t = listStage.filter(s => s.id === e.target.value)
        setStageId({ id: e.target.value, name: t.length ? t[0].content : '' })
    }

    function onChangeRemoteTasks(e: { target: { id: any, checked: boolean } }) {
        if (e.target.checked) {
            setTaskIds([...taskIds, Number(e.target.id)])
        } else {
            setTaskIds(taskIds.filter(r => r !== Number(e.target.id)))
        }
    }

    const onSendData = useCallback(() => {
        tg.sendData(JSON.stringify({ tasks: taskIds }))
    }, [taskIds])

    useEffect(() => {
        tg.MainButton.setParams({
            text: 'Отправить данные'
        })

        // Временное решение
        const tempTasks = JSON.parse(localTaskId ? localTaskId : '')
        const tasks: { id: string, content: string }[] = []
        const tasksRemote: { id: string, content: string }[] = []
        let id = 0
        const stages: { id: string, content: string }[] = [{ id: '0', content: 'Выбранные задачи' }]
        Object.keys(tempTasks).forEach(t => {
            const temp = { id: ``, content: `Неизвестно [] ${tempTasks[t]} шт. 0 руб.` }
            const localFind = localTasks.filter(lt => lt.id === Number(t))
            if (localFind.length) {
                temp.id = `${localFind[0].id}`
                temp.content = `${localFind[0].assortName} [${localFind[0].stageName}] ${tempTasks[t]} шт. ${localFind[0].price} руб.`
                localFind[0].remote === 1 ? tasksRemote.push(temp) : tasks.push(temp)
                if (!stages.some(s => s.content === localFind[0].stageName)) {
                    id++
                    stages.push({ id: `${id}`, content: localFind[0].stageName })
                }
            }
        })

        setListStage(stages)
        setListTasks(tasks)
        setListTasksRemote(tasksRemote)
        setError({ status: false, msg: '' })

        // axios.get<IResponseTask>(`https://195.68.140.114:3001/tasks/${userId}`)
        //     .then((response) => {
        //         if (response.status === 200) {
        //             const tasks: { id: string, content: string }[] = [{ id: '0', content: 'Выберите задачу' }]
        //             const tasksRemote: { id: string, content: string }[] = []
        //             response.data.tasks.forEach(t => {
        //                 const temp = { id: `${t.id}`, content: `${t.assortName} [${t.stageName}] ${t.needTo} шт. ${t.price} руб.` }
        //                 t.remote === 1 ? tasksRemote.push(temp) : tasks.push(temp)
        //             })
        //             setListTasks(tasks)
        //             setListTasksRemote(tasksRemote)
        //             setError({ status: false, msg: '' })
        //         } else {
        //             setError({ status: false, msg: response.data.error ? response.data.error : response.statusText })
        //         }
        //     })
        //     .catch((error) => {
        //         setError({ status: true, msg: error.message })
        //     })
    }, [])

    useEffect(() => {
        if (!checkData()) {
            tg.MainButton.hide()
        } else {
            tg.MainButton.show()
        }
    }, [taskIds])

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
                    {taskIds.length && <h4>Выбрано задач {taskIds.length}</h4>}
                    <select value={stageId.id} onChange={onChangeStages} className={'select'}>
                        {listStage.map(stage => (
                            <option key={stage.id} value={stage.id}>{stage.content}</option>
                        ))}
                    </select>
                    <hr/>
                    {stageId &&
                        <div>
                            {listTasks.map(task => (
                                <p key={task.id} className={(stageId.id !== '0' && task.content.includes(stageId.name)) || (stageId.id === '0' && taskIds.includes(Number(task.id))) ? 'show-task' : 'hide-task'}>
                                    <input key={task.id} id={task.id} type='checkbox' defaultChecked={false}
                                           onChange={onChangeRemoteTasks}/>{task.content}
                                </p>
                            ))}
                        </div>
                    }
                    <div>
                        {listTasksRemote.length && <h3>Удаленные задачи</h3>}
                        {listTasksRemote.map(task => (
                            <p key={task.id} className={'remote-task'}>
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
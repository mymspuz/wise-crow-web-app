import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'

import { useTelegram } from '../../hooks/useTelegram'
import './TaskCompletionForm.css'

interface IMyTasks {
    id: number
    needTo: number
    price: number
    remote: boolean
    priority: number
    assortName: string
    stageName: string
    made: number
    defect: number
    refuse: boolean
}

interface IResponseTask {
    status: boolean
    error: string
    tasks: IMyTasks[]
}

const TaskCompletionForm = () => {
    const { tg } = useTelegram()
    const [search, setSearch] = useSearchParams();
    const [listTasks, setListTasks] = useState<IMyTasks[]>([])
    const [task, setTask] = useState<IMyTasks>({} as IMyTasks)
    const userId = search.get('userId')
    const [taskId, setTaskId] = useState<number>(0)
    const [error, setError] = useState<{ status: boolean, msg: string }>({ status: true, msg: 'Получение данных' })

    const checkData = () => {
        for (const itemTask of listTasks ) {
            if (itemTask.refuse) return true
            const made = itemTask.made ? itemTask.made : 0
            const defect = itemTask.defect ? itemTask.defect : 0
            if (itemTask.needTo && (made + defect) >= itemTask.needTo) return true
        }
        return false
    }

    function onChangeTasks(e: { target: { value: any } }) {
        setTaskId(Number(e.target.value))
    }

    function onChangeMade(e: { target: { value: any } }) {
        setListTasks(listTasks.map(v => {
            if (v.id === taskId) {
                const temp = Number(e.target.value)
                v.made = temp > 0 && !isNaN(temp) ? temp : 0
                return v
            } else {
                return v
            }
        }))
    }

    function onChangeDefect(e: { target: { value: any } }) {
        setListTasks(listTasks.map(v => {
            if (v.id === taskId) {
                const temp = Number(e.target.value)
                v.defect = temp > 0 && !isNaN(temp) ? temp : 0
                return v
            } else {
                return v
            }
        }))
    }

    function onChangeRefuseTask(e: { target: { id: any, checked: boolean } }) {
        setListTasks(listTasks.map(v => {
            if (v.id === taskId) {
                v.refuse = e.target.checked
                return v
            } else {
                return v
            }
        }))
    }

    const onSendData = useCallback(() => {
        tg.sendData(JSON.stringify({ tasks: listTasks }))
    }, [listTasks, tg])

    useEffect(() => {
        tg.MainButton.setParams({
            text: 'Отправить данные'
        })
        axios.get<IResponseTask>(`https://195.68.140.114/tasks/my/${userId}`)
            .then((response) => {
                if (response.status === 200) {
                    const myTasks: IMyTasks[] = [{ id: 0, assortName: 'Выберите задачу', stageName: '', needTo: 0, price: 0, priority: 0, remote: false, made: 0, defect: 0, refuse: false }]
                    response.data.tasks.forEach(t => {
                        myTasks.push(t)
                    })
                    setListTasks(myTasks)
                    setError({ status: false, msg: '' })
                } else {
                    console.log('response - ', response)
                    setError({ status: false, msg: response.data.error ? response.data.error : response.statusText })
                }
            })
            .catch((error) => {
                console.log('error - ', error.message)
                setError({ status: true, msg: error.message })
            })
    }, [])

    useEffect(() => {
        const temp = checkData()
        !temp ? tg.MainButton.hide() : tg.MainButton.show()
    }, [listTasks])

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData)
        return () => {
            tg.offEvent('mainButtonClicked', onSendData)
        }
    }, [onSendData])

    useEffect(() => {
        setTask(listTasks.filter(l => l.id === taskId)[0])
    }, [taskId])

    return (
        <div className={"form"}>
            {error.status
                ?
                <h3>{error.msg}</h3>
                :
                <>
                    <select value={taskId} onChange={onChangeTasks} className={'select'}>
                        {listTasks.map(task => (
                            <option key={task.id} value={task.id}>{`${task.assortName} ${task.stageName ? "[" + task.stageName + "]" : ""}`}</option>
                        ))}
                    </select>
                    <hr/>
                    {taskId !== 0 && task && task.id === taskId
                        ?
                        <>
                            <p>Нужно было сделать {task.needTo}</p>
                            <div>
                                <input
                                    className={'input'}
                                    type="number"
                                    placeholder={'Количество сделанных'}
                                    value={task.made}
                                    onChange={onChangeMade}
                                    min={0}
                                />
                            </div>
                            <div>
                                <input
                                    className={'input'}
                                    type="number"
                                    placeholder={'Количество брака'}
                                    value={task.defect}
                                    onChange={onChangeDefect}
                                    min={0}
                                />
                            </div>
                            <div>
                                <input type='checkbox' className={'checkbox'} onChange={onChangeRefuseTask} checked={task.refuse}/>Освободить задачу
                            </div>
                        </>
                        :
                        <p>Не выбрана задача</p>
                    }
                </>
            }
        </div>
    )
}

export default TaskCompletionForm
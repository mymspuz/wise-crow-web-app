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
    const localTaskId = search.get('tasks')
    const [taskId, setTaskId] = useState<number>(0)
    const [error, setError] = useState<{ status: boolean, msg: string }>({ status: true, msg: 'Получение данных' })

    const localTasks: IMyTasks[] = require('../../data/tasks.json')

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

    function onChangeMade(e: { target: { value: any, id: string } }) {
        const taskId = Number(e.target.id)
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

    function onChangeDefect(e: { target: { value: any, id: string } }) {
        const taskId = Number(e.target.id)
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
        const taskId = Number(e.target.id)
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
        // const myTasks: IMyTasks[] = [{ id: 0, assortName: 'Выберите задачу', stageName: '', needTo: 0, price: 0, priority: 0, remote: false, made: 0, defect: 0, refuse: false }]
        const myTasks: IMyTasks[] = []
        const tempTasks = JSON.parse(localTaskId ? localTaskId : '')
        Object.keys(tempTasks).forEach(t => {
            const localFind = localTasks.filter(lt => lt.id === Number(t))
            if (localFind.length) {
                myTasks.push({
                    id: localFind[0].id,
                    assortName: localFind[0].assortName,
                    stageName: localFind[0].stageName,
                    needTo: tempTasks[t],
                    price: localFind[0].price,
                    priority: 0,
                    remote: false,
                    made: 0,
                    defect: 0,
                    refuse: false
                })
            }
        })
        setListTasks(myTasks)
        setError({ status: false, msg: '' })





        // axios.get<IResponseTask>(`https://195.68.140.114:3001/tasks/my/${userId}`)
        //     .then((response) => {
        //         if (response.status === 200) {
        //             const myTasks: IMyTasks[] = [{ id: 0, assortName: 'Выберите задачу', stageName: '', needTo: 0, price: 0, priority: 0, remote: false, made: 0, defect: 0, refuse: false }]
        //             response.data.tasks.forEach(t => {
        //                 myTasks.push(t)
        //             })
        //             setListTasks(myTasks)
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
        <div className="telegram-container">
            <div className="form-container">
                {error.status
                    ?
                    <h3>{error.msg}</h3>
                    :
                    <>
                        {listTasks.map(task => (
                            <fieldset key={task.id} className={'form-section'}>
                                <p>Нужно было сделать <strong>{task.needTo}</strong>
                                    <br/>{`${task.assortName} ${task.stageName ? "[" + task.stageName + "]" : ""}`}
                                </p>
                                <div className="input-row">
                                    <div className="input-group half">
                                        <input
                                            type="number"
                                            value={task.made ? task.made : ''}
                                            onChange={onChangeMade}
                                            placeholder={"Количество сделанных"}
                                            required
                                            min={0}
                                        />
                                    </div>

                                    <div className="input-group half">
                                        <input
                                            type="number"
                                            value={task.defect ? task.defect : ''}
                                            onChange={onChangeDefect}
                                            placeholder={'Количество брака'}
                                            min={0}
                                        />
                                    </div>
                                </div>
                                <div className="input-row">
                                    {/*<div className="input-group">*/}
                                    <div className="switch-group">
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={task.refuse}
                                                onChange={onChangeRefuseTask}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                        <span>Освободить задачу</span>
                                    </div>
                                    {/*</div>*/}
                                </div>

                                {/*<div>*/}
                                {/*    <input*/}
                                {/*        id={`${task.id}`}*/}
                                {/*        className={'input'}*/}
                                {/*        type="number"*/}
                                {/*        placeholder={'Количество сделанных'}*/}
                                {/*        value={task.made ? task.made : ''}*/}
                                {/*        onChange={onChangeMade}*/}
                                {/*        min={0}*/}
                                {/*    />*/}
                                {/*</div>*/}
                                {/*<div>*/}
                                {/*    <input*/}
                                {/*        id={`${task.id}`}*/}
                                {/*        className={'input'}*/}
                                {/*        type="number"*/}
                                {/*        placeholder={'Количество брака'}*/}
                                {/*        value={task.defect ? task.defect : ''}*/}
                                {/*        onChange={onChangeDefect}*/}
                                {/*        min={0}*/}
                                {/*    />*/}
                                {/*</div>*/}
                                {/*<div>*/}
                                {/*    <input*/}
                                {/*        id={`${task.id}`}*/}
                                {/*        type='checkbox'*/}
                                {/*        className={'checkbox'}*/}
                                {/*        onChange={onChangeRefuseTask}*/}
                                {/*        checked={task.refuse}*/}
                                {/*    />Освободить задачу*/}
                                {/*</div>*/}
                            </fieldset>
                        ))}
                    </>
                }
            </div>
        </div>
    )
}

export default TaskCompletionForm
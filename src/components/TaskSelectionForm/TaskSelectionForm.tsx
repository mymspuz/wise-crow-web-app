import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useTelegram } from '../../hooks/useTelegram'
import './TaskSelectionForm.css'

const TaskSelectionForm = () => {
    const [taskId, setTaskId] = useState<string>('0')
    const [taskRemoteIds, setTaskRemoteIds] = useState<number[]>([])
    const { tg } = useTelegram()
    const [search, setSearch] = useSearchParams();
    const tasks = search.get('tasks');
    const tasksRemote = search.get('tasksRemote');
    const listTasks = tasks ? tasks.split('||').map(i => ({ id: i.split('|')[0], content: i.split('|')[1] })) : []
    const listTasksRemote = tasksRemote ? tasksRemote.split('||').map(i => ({ id: i.split('|')[0], content: i.split('|')[1] })) : []
    listTasks.unshift({ id: '0', content: 'Выберите задачу' })

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
            <select value={taskId} onChange={onChangeTasks} className={'select'}>
                {listTasks.map(task => (
                    <option key={task.id} value={task.id}>{task.content}</option>
                ))}
            </select>
            <hr/>
            <p>
                {listTasksRemote.map(task => (
                    <>
                        <input key={task.id} id={task.id} type='checkbox' defaultChecked={false} onChange={onChangeRemoteTasks} />{task.content}
                    </>
                ))}
            </p>
        </div>
    );
};

export default TaskSelectionForm;
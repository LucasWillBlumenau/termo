const GameManager = word => {
    const wordsInputsList = document.querySelectorAll('[data-js="word-cards"] > form')
    let currentAttempt = 0
    let wordCharList = word.split('')
    let stateManager = InputsStateManager(wordsInputsList[currentAttempt].children)
    let guessCharList
    let lastGuess
    
    const guessAWord = () => {
        lastGuess = stateManager.getGuessWord()
        checkMatchesAndUpdateInputsState()
        if (didPlayerWinTheGame())
            displayGameVictoryAlert()
        else
            incrementCurrentAttemptAndSetNewStateManager()
    }

    const didPlayerWinTheGame = () => lastGuess === word

    const displayGameVictoryAlert = () => {
        const victoryAlert = createGameAlert()
        setTimeout(() => document.body.appendChild(victoryAlert), 500)
        setTimeout(() => document.body.removeChild(victoryAlert), 1000)
    }

    const createGameAlert = () => {
        const div = document.createElement('div')
        div.setAttribute('class', 'modal')
        div.innerHTML = `
            <div class="victory-alert">
                <h2>Você ganhou o jogo</h2>
            </div>
        `
        return div
    }

    const checkMatchesAndUpdateInputsState = () => {
        guessCharList = lastGuess.split('')
        wordCharList.forEach(updateInputState)
    }

    const updateInputState = (letter, index) => {
        if (guessCharList[index] === letter)
            stateManager.setPositionGuessState(index)
        else if (word.includes(guessCharList[index]))
            stateManager.setRightGuessState(index)
        else
            stateManager.setWrongGuessState(index)
    }

    const incrementCurrentAttemptAndSetNewStateManager = () => {
        currentAttempt++
        stateManager.disableInputs()
        stateManager = InputsStateManager(wordsInputsList[currentAttempt].children)
        stateManager.enableInputsAndSetFocusToFirstOne()
    }

    return { guessAWord }
}


const InputsStateManager = inputs => {

    const inputsList = Array.from(inputs)

    const setClassAttributeAndTransitionSpeed = (className, index) => {
        inputsList[index].setAttribute('class', className)
        inputsList[index].setAttribute('style', `--transition-speed: ${index * 400 + 300}ms;`)
    }
    
    const enableInputsAndSetFocusToFirstOne = () => {
        inputsList.forEach(formSubmitter.enableInput)
        inputsList[0].focus()
    }

    const disableInputs = () => inputsList.forEach(formSubmitter.preventInputOfBeEdited)
    
    const setWrongGuessState = index => setClassAttributeAndTransitionSpeed('letter-card wrong-guess', index)
    const setRightGuessState = index => setClassAttributeAndTransitionSpeed('letter-card right-guess', index)
    const setPositionGuessState = index => setClassAttributeAndTransitionSpeed('letter-card right-position', index)
    const getGuessWord = () => {
        const values = inputsList.map(input => input.value)
        const word = values.join('')
        return word.toLowerCase()
    }

    return {
        setWrongGuessState,
        setRightGuessState,
        setPositionGuessState,
        getGuessWord,
        disableInputs,
        enableInputsAndSetFocusToFirstOne,
    }
}


const formSubmitter = (() => {

    const addInputsEventsToFormInputs = form => {
        const inputs = Array.from(form.querySelectorAll('input'))
        inputs.forEach(addEventToInput)
    }

    const addEventToInput = input => input.addEventListener('input', inputEvent)

    const inputEvent = event => {
        const input = event.target
        const typedValue = event.data
        const letterRegex = /[a-z]/
        if (!letterRegex.test(typedValue))
            return
        input.value  = typedValue
        input.nextElementSibling.focus()
    }

    const isFormIsFull = form => {
        const inputs = form.querySelectorAll('input')
        for(let input of inputs) {
            if (input.value === '')
                return false
        }
        return true
    }

    const preventInputsOfBeEdited = form => {
        const inputs = form.querySelectorAll('input')
        inputs.forEach(preventInputOfBeEdited)
    }

    const preventInputOfBeEdited = input => input.disabled = true

    const enableInput = input => input.disabled = false

    return { preventInputsOfBeEdited, preventInputOfBeEdited, enableInput, isFormIsFull, addInputsEventsToFormInputs }
})()


const gameLoop = (() => {
    const game = GameManager('house')
    const forms = document.querySelectorAll('[data-js="word-cards"] > form')
    forms.forEach(formSubmitter.addInputsEventsToFormInputs)

    const submitEvent = event => {
        event.preventDefault()
        console.log(event.target);
        if (!formSubmitter.isFormIsFull(event.target))
            return
        game.guessAWord()
    }

    const addSubmitEventToForm = form => form.addEventListener('submit', submitEvent)
    
    const run = () => {
        const [, ...disabledForms] = forms
        disabledForms.forEach(formSubmitter.preventInputsOfBeEdited)
        forms.forEach(addSubmitEventToForm)
    }

    return { run }
})()


gameLoop.run()

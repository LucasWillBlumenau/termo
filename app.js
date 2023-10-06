const GameManager = word => {
    const wordsInputsList = document.querySelectorAll('[data-js="word-cards"] > form')
    let currentAttempt = 0
    let wordCharList = word.split('')
    let stateManager = InputsStateManager(wordsInputsList[currentAttempt].children)
    let guessCharList
    let lastGuess
    

    const guessAWord = () => {
        lastGuess = stateManager.getGuessWord()
        checkIfPlayerWonTheGame()
        checkMatchesAndUpdateInputsState()
        incrementCurrentAttemptAndSetNewStateManager()
    }

    const checkIfPlayerWonTheGame = () => {
        if (lastGuess === word)
            console.log('You won the game')
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
        stateManager = InputsStateManager(wordsInputsList[currentAttempt].children)
    }

    return { guessAWord }
}


const InputsStateManager = inputsList => {

    const setClassAttributeAndTransitionSpeed = (className, index) => {
        inputsList[index].setAttribute('class', className)
        inputsList[index].setAttribute('style', `--transition-speed: ${index * 400 + 300}ms;`)
    }
 
    const setWrongGuessState = index => setClassAttributeAndTransitionSpeed('letter-card wrong-guess', index)
    const setRightGuessState = index => setClassAttributeAndTransitionSpeed('letter-card right-guess', index)
    const setPositionGuessState = index => setClassAttributeAndTransitionSpeed('letter-card right-position', index)
    const getGuessWord = () => {
        const values = Array.from(inputsList).map(input => input.value)
        const word = values.join('')
        return word.toLowerCase()
    }

    return { setWrongGuessState, setRightGuessState, setPositionGuessState, getGuessWord }
}


const gameLoop = (() => {
    const game = GameManager('house')
    const forms = document.querySelectorAll('[data-js="word-cards"] > form')

    const submitEvent = event => {
        event.preventDefault()
        game.guessAWord()
    }

    const addSubmitEventToForm = form => form.addEventListener('submit', submitEvent)
    
    const init = () => forms.forEach(addSubmitEventToForm)

    return { init }
})()


gameLoop.init()

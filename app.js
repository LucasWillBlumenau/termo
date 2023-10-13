const Game = (word, maxAttempts) => {
    let attempts = 0
    let charsArray = [...word]
    let isGameLost = false
    let isGameWon = false
    let guess

    const guessAWord = guessWord => {
        guess = guessWord
        attempts += 1
        setGameState()
        return getGuessResult()
    }

    const setGameState = () => {
        isGameWon = word === guess
        isGameLost = attempts === maxAttempts && !isGameWon
    }

    const getGuessResult = () => {
        const guessWordChars = [...guess]
        const guessesResult = guessWordChars.map((letter, index) => getLetterGuessState(charsArray[index], letter))
        return guessesResult
    }

    const getLetterGuessState = (wordLetter, guessLetter) => {
        const letter = guessLetter
        const isRightLetterPosition = guessLetter === wordLetter
        const wordIncludeLetter = word.includes(guessLetter)
        return { letter, isRightLetterPosition, wordIncludeLetter }
    }

    const getIsGameWon = () => isGameWon

    const getIsGameLost = () => isGameLost

    return { guessAWord, getIsGameLost, getIsGameWon }
}


const gameLoop = (() => {
    const forms = document.querySelectorAll('[data-js="word-cards"] > form')
    const randomWord = getRandomWord()
    const game = Game(randomWord, forms.length)
    let currentAttempt = 0

    const start = () => {
        forms[currentAttempt].addEventListener('submit', guessAWordEvent)
        addEventsToFormInputs(forms[currentAttempt])
        disableAllFormsExceptTheFirstOne()
    }

    const addEventsToFormInputs = form => {
        const inputs = form.querySelectorAll('input')
        inputs.forEach(addEventToInput)
    }

    const addEventToInput = input => {
        input.addEventListener('keydown', keyDownEvent)
        input.addEventListener('input', inputEvent)
    }

    const keyDownEvent = event => {
        const input = event.target
        const keyPressed = event.key
        const nextSibling = input.nextElementSibling
        const previousSibling  = input.previousElementSibling
        const deleteLettersKeys = ['Backspace', 'Delete']

        if (keyPressed === 'ArrowLeft' && previousSibling)
            previousSibling.focus()
        else if (keyPressed === 'ArrowRight' && nextSibling)
            nextSibling.focus()
        else if (deleteLettersKeys.includes(keyPressed))
            input.value = ''
    }

    const inputEvent = event => {
        const input = event.target
        const inputValue = input.value
        const regexPatter = /[a-z]/
        const typedValue = event.data

        if (regexPatter.test(typedValue)){
            input.value = typedValue
            input.nextElementSibling.focus()
        }
        else {
            input.value = inputValue.length > 1? searchLetterInString(inputValue): ''
        }
    }

    const searchLetterInString = str => {
        const regexPatter = /[a-z]/
        const [letter] = [...str].filter(char => regexPatter.test(char))
        return letter
    } 

    const disableAllFormsExceptTheFirstOne = () => {
        const [_, ...formsToBeDisabled] = forms
        formsToBeDisabled.forEach(disableFormInputs)
    }

    const guessAWordEvent = event => {
        event.preventDefault()
        const word = getWordFromForm()
        if (!isWordListed(word)) {
            alert('A palavra não está listada')
            return
        }

        const guessResults = game.guessAWord(word)
        updateInputColors(guessResults)
        avaliateGameState()
    }

    const getWordFromForm = () => {
        const inputs = Array.from(forms[currentAttempt].querySelectorAll('input'))
        const word = inputs.map(input => input.value).join('')
        return word
    }
    
    const updateInputColors = guessResults => {
        const inputs = Array.from(forms[currentAttempt].querySelectorAll('input'))
        const checkedLetters = []
        guessResults.forEach((guessResult, index) => {
            const input = inputs[index]
            const transitionSpeed = index * 200 + 300
            const letterInSeen = checkedLetters.includes(guessResult.letter)
            checkGuessStateAndUpdateInputColor(input, { letterInSeen, ...guessResult }, transitionSpeed)
            checkedLetters.push(guessResult.letter)
        })
    }

    const checkGuessStateAndUpdateInputColor = (input, guessResult, transitionSpeed) => {
        if (guessResult.isRightLetterPosition)
            setClassAttributeAndTransitionSpeed(input, 'letter-card right-position', transitionSpeed)
        else if (guessResult.wordIncludeLetter && !guessResult.letterInSeen)
            setClassAttributeAndTransitionSpeed(input, 'letter-card right-guess', transitionSpeed)
    }

    const setClassAttributeAndTransitionSpeed = (input, className, transitionSpeed) => {
        input.setAttribute('class', className)
        input.setAttribute('style', `--transition-speed: ${transitionSpeed}ms;`)
    }

    const avaliateGameState = () => {
        if (game.getIsGameWon())
            winTheGameEvent()
        else if (game.getIsGameLost())
            loseTheGameEvent()
        else
            enableNextFormAndDisableCurrentOne()
    }

    const winTheGameEvent = () => {
        alert('Você acertou a palavra')
        disableFormInputs(forms[currentAttempt])
    }

    const loseTheGameEvent = () => {
        alert(`A palavra era ${randomWord}`)
        disableFormInputs(forms[currentAttempt])
    }

    const enableNextFormAndDisableCurrentOne = () => {
        forms[currentAttempt].removeEventListener('submit', guessAWordEvent)
        disableFormInputs(forms[currentAttempt])
        currentAttempt += 1
        forms[currentAttempt].addEventListener('submit', guessAWordEvent)
        enableFormInputsAndGiveFocusToTheFirstOne(forms[currentAttempt])
        addEventsToFormInputs(forms[currentAttempt])
    }

    const disableFormInputs = form => {
        const inputs = form.querySelectorAll('input')
        inputs.forEach(input => input.disabled = true)
    }

    const enableFormInputsAndGiveFocusToTheFirstOne = form => {
        const inputs = form.querySelectorAll('input')
        inputs.forEach(input => input.disabled = false)
        inputs[0].focus()
    }

    return { start }
})()


gameLoop.start()

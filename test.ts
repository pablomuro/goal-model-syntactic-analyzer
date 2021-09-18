import { ErrorLogger } from './core/ErroLogger';
import { ModelValidator } from './core/ModelValidator';

export class ModelRulesValidatorTest {
  modelValidator: ModelValidator
  constructor(modelValidator: ModelValidator) {
    this.modelValidator = modelValidator
  }

  test() {
    const nodeSet = this.modelValidator.tree._nodeSet

    const queryNode = nodeSet['7f04d613-d3b0-4312-9ad8-43c7d2a0db3f']
    const achieveNode = nodeSet['a07c4186-f533-4a0a-afbe-6efcb81222f6']
    const task1 = nodeSet['5b67b70f-5934-4f0a-a5fb-a2837fb04b74']

    let correctInputList = []
    let wrongInputList = []

    let isValidateWrong = false

    function validate(list: any[], callback: Function) {
      for (let input of list) {
        callback(input)
      }
    }
    function validateWrong(list: any[], callback: Function) {
      if (!isValidateWrong) return
      validate(list, callback)
    }


    console.log('Testing...')
    // Sequencia de Id Certo
    this.modelValidator.validateId('G1: Clean All Dirty Rooms [G2;G3]', this.modelValidator.goalIdChecker()) // Pass
    this.modelValidator.resetValidator()

    // Sequencia de Id Errado
    // this.modelValidator.validateId('G2: Clean All Dirty Rooms [G2;G3]', this.modelValidator.goalIdChecker()) // Error

    // Estrutura certa
    correctInputList = [
      'G1: Clean All Dirty Rooms [G2;G3]',
      'G1: Clean All Dirty Rooms [G2#G3]',
      'G1: Clean All Dirty Rooms[G2;G3]',
      'G1: Clean All Dirty Rooms [FALLBACK(G1)]',
      'G1: Clean All Dirty Rooms [FALLBACK(G1,G2)]',
      'G1:Clean All Dirty Rooms [G2;G3]'
    ]

    validate(correctInputList, (input: any) => this.modelValidator.validateGoalTextProperty(input))

    // Estrutura errada
    wrongInputList = [
      'G1: Clean All Dirty Rooms [G2;G3',
      'G1: Clean All Dirty Rooms [G2%G3]',
      'G1: Clean All Dirty Rooms [G2G3]',
      'G1: Clean All Dirty Rooms FALLBACK',
      'G1: Clean All Dirty Rooms [FALLBACK(G1,G2,)]',
    ]
    validateWrong(wrongInputList, (input: any) => this.modelValidator.validateGoalTextProperty(input))


    //GoalType
    //Pass
    correctInputList = [
      'Query',
      'Achieve',
      'Perform'
    ]
    validate(correctInputList, (input: any) => this.modelValidator.validateGoalType(input))

    // //Error
    wrongInputList = [
      'query',
      'achieve',
      'perform',
      'querye',
      'asda',
    ]
    validateWrong(wrongInputList, (input: any) => this.modelValidator.validateGoalTextProperty(input))

    //validateNodeIsALeaf
    //Pass
    this.modelValidator.validateNodeIsALeaf([])
    this.modelValidator.validateNodeIsNotALeaf([this.modelValidator.tree.root])

    //Error
    // this.modelValidator.validateNodeIsALeaf([this.modelValidator.tree.root])
    // this.modelValidator.validateNodeIsNotALeaf([])

    //validate QueryGoal Node
    //Pass
    this.modelValidator.currentNodeRef.node = queryNode
    queryNode.goalData.customProperties.QueriedProperty = 'world_db->select( r : Room | !r.is_clean && r.abc)'
    this.modelValidator.validateQueryGoalProperties(queryNode.goalData.customProperties)

    correctInputList = [
      'world_db->select( r : Room | !r.is_clean && r.abc)',
      `world_db->select(  r : Room | r.is_clean)`,
      `world_db->select(r:Room | r.is_clean)`,
      `world_db->select(r:Room | !r.is_clean)`,
      `world_db->select(r:Room | r.is_clean = "asb" )`,
      `world_db->select(r:Room | r.is_clean <> "asb" )`,
      `world_db->select(r:Room | r.is_clean = 123 )`,
      `world_db->select(r:Room | r.is_clean <> 123 )`,
      `world_db->select(r:Room | r.is_clean > 123 )`,
      `world_db->select(r:Room | r.is_clean >= 123 )`,
      `world_db->select(r:Room | r.is_clean < 123 )`,
      `world_db->select(r:Room | r.is_clean <= 123 )`,
      `world_db->select(r:Room | r.is_clean in r.teste )`,
      `world_db->select(r:Room | r.is_clean && r.teste )`,
      `world_db->select(r:Room | r.is_clean || r.teste )`,
      `world_db->select(r:Room | )`,
    ]
    validate(correctInputList, (input: any) => {
      queryNode.goalData.customProperties.QueriedProperty = input
      this.modelValidator.validateQueryGoalQueriedProperty(queryNode.goalData.customProperties, {})
    })

    //ERRO
    wrongInputList = [
      `world_db->select(r:Room | r.is_clean >= "tes")`,
      `world_db->seleAct(r:Room | r.is_clean)`,
      `World_db->select(r:Room | !r.is_clean)`,
      `world_db->select(r:Room | r.is_clean =  )`,
      `world_db->select(r:Room | r.is_clean <>  )`,
      `world_db->select(r:Room | r.is_clean =  )`,
      `world_db->select(r:Room | r.is_clean <>  )`,
      `world_db->select(r:Room | r.is_clean >  )`,
      `world_db->select(r:Room | r.is_clean >=  )`,
      `world_db->select(r:Room | r.is_clean <  )`,
      `world_db->select(r:Room | r.is_clean <=  )`,
      `world_db->select(r:Room | r.is_clean in  )`,
      `world_db->select(r:Room | r.is_clean &&  )`,
      `world_db->select(r:Room | r.is_clean ||  )`,
      `world_db->select(r:Room | r.is_clean )`,
    ]

    isValidateWrong = true
    validateWrong(wrongInputList, (input: any) => {
      queryNode.goalData.customProperties.QueriedProperty = input
      this.modelValidator.validateQueryGoalQueriedProperty(queryNode.goalData.customProperties, {})
    })
    isValidateWrong = false

    //validate AchieveGoal Node
    //Pass
    this.modelValidator.currentNodeRef.node = achieveNode
    this.modelValidator.validateAchieveGoalProperties(achieveNode.goalData.customProperties)

    // correctInputList = [
    //   'rooms->forAll(current_room | current_room.is_clean && current_room.abc)',
    //   'current_room.is_clean >= 1',
    //   'current_room.is_clean'
    // ]
    // validate(correctInputList, (input: any) => {
    //   achieveNode.goalData.customProperties.AchieveCondition = input
    //   this.modelValidator.validateAchieveGoalAchieveCondition(queryNode.goalData.customProperties, { rooms: 'Sequence(Room)', rooms2: 'Sequence(Room)' })
    // })

    // Error
    wrongInputList = [
      'rooms->forAll(current_room | current_room.is_clean %% r.is_clean)',
      'rooms->forAll(current_room | current_room.is_clean <= a)',
      'rooms->forAll(current_room | current_room.is_clean + a)',
    ]

    validateWrong(wrongInputList, (input: any) => {
      achieveNode.goalData.customProperties.AchieveCondition = input
      this.modelValidator.validateAchieveGoalAchieveCondition(achieveNode.goalData.customProperties, { rooms: 'Sequence(Room)' })
    })


    // Error
    // achieveNode.goalData.customProperties.AchieveCondition = 'rooms->forAll(current_room | current_room.is_clean && current_room.abc)'
    // this.modelValidator.validateAchieveGoalAchieveCondition(achieveNode.goalData.customProperties, {})

    // Error
    // achieveNode.goalData.customProperties.Monitors = 'rooms , rooms2 : SAequence(Room)'
    // achieveNode.goalData.customProperties.Monitors = 'ro%$ms , rooms2 : Sequence(Room)'
    // this.modelValidator.validateMonitorsProperty(achieveNode.goalData.customProperties.Monitors, { rooms: 'Sequence(Room)', rooms2: 'Sequence(Room)' })








    // ==================================================
    console.log(`Total de errors: ${ErrorLogger.errorCount}`)
  }
}
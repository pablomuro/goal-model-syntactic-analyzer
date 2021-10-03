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
    const creationNode = nodeSet['c4686de9-74b7-4cac-96e7-20dc2e08609e']
    const task1 = nodeSet['5b67b70f-5934-4f0a-a5fb-a2837fb04b74']

    let correctInputList = []
    let wrongInputList = []


    function validate(list: any[], callback: Function) {
      for (let input of list) {
        callback(input)
      }
    }
    function validateWrong(isValidateWrong: boolean, list: any[], callback: Function) {
      if (!isValidateWrong) return
      validate(list, callback)
    }


    console.log('Testing...')
    // Sequencia de Id Certo
    this.modelValidator.validateId('G1: Clean All Dirty Rooms [G2;G3]', this.modelValidator.goalIdChecker()) // Pass
    this.modelValidator.resetValidator()

    // Sequencia de Id Errado
    // this.modelValidator.validateId('G2: Clean All Dirty Rooms [G2;G3]', this.modelValidator.goalIdChecker()) // Error

    // Validate GoalText
    // Estrutura certa
    correctInputList = [
      'G1: Clean All Dirty Rooms [G2;G3]',
      'G1: Clean All Dirty Rooms [G2#G3]',
      'G1: Clean All Dirty Rooms[G2;G3]',
      'G1: Clean All Dirty Rooms [FALLBACK(G1)]',
      'G1: Clean All Dirty Rooms [FALLBACK(FALLBACK(G1,G2),G3)]',
      'G11: Clean All Dirty Rooms [FALLBACK(G1,G2)]',
      'G1:Clean All Dirty Rooms [G2;G3]'
    ]

    validate(correctInputList, (input: any) => this.modelValidator.validateGoalTextProperty(input))

    // Estrutura errada
    wrongInputList = [
      'G1: Clean All Dirty Rooms [G2;G3',
      'G1: Clean All Dirty Rooms [G2%G3]',
      'G1: Clean All Dirty Rooms [G2G3]',
      'G1: Clean All Dirty Rooms FALLBACK',
      'G1: Clean All Dirty Rooms [FALLBACK(FALLBACK(G1,G2),)]',
      'G1: Clean All Dirty Rooms [FALLBACK(G1,G2,)]',
    ]

    validateWrong(false,
      wrongInputList, (input: any) => this.modelValidator.validateGoalTextProperty(input))

    // Validate TaskeName
    correctInputList = [
      'AT1: Test',
      'AT2: test',
      'AT3: Test',
    ]

    validate(correctInputList, (input: any) => this.modelValidator.validateTaskTextProperty(input))

    // Estrutura errada
    wrongInputList = [
      'G1: Test',
      'A2: test',
      'T1:Test',
      'T2: Test ASD',
      'T3: Test *&',
    ]

    validateWrong(false,
      wrongInputList, (input: any) => this.modelValidator.validateTaskTextProperty(input))

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
    validateWrong(false,
      wrongInputList, (input: any) => this.modelValidator.validateGoalTextProperty(input))

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

    validateWrong(false,
      wrongInputList, (input: any) => {
        queryNode.goalData.customProperties.QueriedProperty = input
        this.modelValidator.validateQueryGoalQueriedProperty(queryNode.goalData.customProperties, {})
      })

    //validate AchieveGoal Node
    //Pass
    this.modelValidator.currentNodeRef.node = achieveNode
    this.modelValidator.validateAchieveGoalProperties(achieveNode.goalData.customProperties)

    correctInputList = [
      'rooms->forAll(current_room | current_room.is_clean && current_room.abc)',
      'current_room.is_clean >= 1',
      'current_room.is_clean',
      ''
    ]
    validate(correctInputList, (input: any) => {
      achieveNode.goalData.customProperties.Controls = "current_room : Room"
      achieveNode.goalData.customProperties.Monitors = "rooms";
      achieveNode.goalData.customProperties.AchieveCondition = input
      delete achieveNode.goalData.customProperties.UniversalAchieveCondition
      this.modelValidator.validateAchieveGoalAchieveConditionAndUniversalAchieveCondition(achieveNode.goalData.customProperties, { rooms: 'Sequence(Room)', current_room: 'Sequence(Room)' })
    })

    correctInputList = [
      'rooms->forAll(current_room | current_room.is_clean && current_room.abc)',
      'current_room.is_clean >= 1',
      'current_room.is_clean',
      ''
    ]
    validate(correctInputList, (input: any) => {
      achieveNode.goalData.customProperties.Controls = "current_room : Room"
      achieveNode.goalData.customProperties.Monitors = "rooms";
      achieveNode.goalData.customProperties.UniversalAchieveCondition = input
      delete achieveNode.goalData.customProperties.AchieveCondition
      this.modelValidator.validateAchieveGoalAchieveConditionAndUniversalAchieveCondition(achieveNode.goalData.customProperties, { rooms: 'Sequence(Room)', current_room: 'Sequence(Room)' })
    })

    // Error
    wrongInputList = [
      'wrong->forAll(current_room | current_room.is_clean %% r.is_clean)',
      'wrong->forAll(current_room | current_room.is_clean <= a)',
      'wrong->forAll(current_room | current_room.is_clean + a)',
    ]

    validateWrong(false,
      wrongInputList, (input: any) => {
        achieveNode.goalData.customProperties.AchieveCondition = input
        this.modelValidator.validateAchieveGoalAchieveConditionAndUniversalAchieveCondition(achieveNode.goalData.customProperties, { rooms: 'Sequence(Room)' })
      })


    // Validate Controls
    //PASS
    correctInputList = [
      'rooms : Room, rooms2 : Sequence(Room)',
      'rooms : Room',
      'rooms2 : Sequence(Room)'
    ]
    validate(correctInputList, (input: any) => {
      achieveNode.goalData.customProperties.Controls = input
      this.modelValidator.validateControlsProperty(achieveNode.goalData.customProperties.Controls)
    })

    // Error
    wrongInputList = [
      'rooms : asas, rooms2 : SAequence(Room)',
      'ro%$ms , rooms2 : Sequence(Room)',
      'rooms : Room, rooms2 : SAequence(Room)',
    ]

    validateWrong(false,
      wrongInputList, (input: any) => {
        achieveNode.goalData.customProperties.Controls = input
        this.modelValidator.validateControlsProperty(achieveNode.goalData.customProperties.Controls)
      })


    //Validate Monitors
    //ERRO
    wrongInputList = [
      'rooms : asas, rooms2 : SAequence(Room)',
      'ro%$ms , rooms2 : Sequence(Room)',
      'rooms : Room, rooms2 : SAequence(Room)',
    ]
    validateWrong(false,
      wrongInputList, (input: any) => {
        achieveNode.goalData.customProperties.Monitors = input
        this.modelValidator.validateMonitorsProperty(achieveNode.goalData.customProperties.Monitors, { rooms: 'Sequence(Room)', rooms2: 'Sequence(Room)' })
      })

    correctInputList = [
      {
        Context: 'Condition',
        Condition: 'not current_room.is_occupied',
      },
      {
        Context: 'Condition',
        Condition: 'not current_room.is_occupied',
      },
      {
        Context: 'Trigger',
        Trigger: 'E1,E2,E3'
      },
      {
        Context: 'Trigger',
        Trigger: 'E1'
      },

    ]
    let count = 0
    validate(correctInputList, (input: any) => {
      creationNode.goalData.customProperties = {
        ...input
      }
      console.log((++count))
      this.modelValidator.validateContextProperty(creationNode.goalData.customProperties)
    })

    // Error
    wrongInputList = [

      {
        Context: 'Trigger',
        Condition: 'not current_room.is_occupied',
      },
      {
        Context: 'Condition',
        Trigger: 'not current_room.is_occupied',
      },
      {
        Context: 'Condition',
        Trigger: 'E1,E2,E3'
      },
      {
        Context: 'Trigger',
        Trigger: 'E1, E3'
      },
      {
        Context: 'Condition',
        Condition: 'not current$_room.is_occupied',
      },
    ]

    validateWrong(true,
      wrongInputList, (input: any) => {
        creationNode.goalData.customProperties = {
          ...input
        }
        console.log((++count))
        this.modelValidator.validateContextProperty(creationNode.goalData.customProperties)
      })



    // ==================================================
    console.log(`Total de errors: ${ErrorLogger.errorCount}`)
  }
}
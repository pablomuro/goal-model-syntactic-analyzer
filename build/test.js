"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRulesValidatorTest = void 0;
const ErroLogger_1 = require("./core/ErroLogger");
class ModelRulesValidatorTest {
    constructor(modelValidator) {
        this.modelValidator = modelValidator;
    }
    test() {
        const nodeSet = this.modelValidator.tree._nodeSet;
        const queryNode = nodeSet['7f04d613-d3b0-4312-9ad8-43c7d2a0db3f'];
        const achieveNode = nodeSet['a07c4186-f533-4a0a-afbe-6efcb81222f6'];
        const task1 = nodeSet['5b67b70f-5934-4f0a-a5fb-a2837fb04b74'];
        console.log('Testing...');
        // Sequencia de Id Certo
        this.modelValidator.validateId('G1: Clean All Dirty Rooms [G2;G3]', this.modelValidator.goalIdChecker()); // Pass
        this.modelValidator.resetValidator();
        // Sequencia de Id Errado
        // this.modelValidator.validateId('G2: Clean All Dirty Rooms [G2;G3]', this.modelValidator.goalIdChecker()) // Error
        // Estrutura certa
        this.modelValidator.validateGoalTextProperty('G1: Clean All Dirty Rooms [G2;G3]'); // Pass
        this.modelValidator.validateGoalTextProperty('G1: Clean All Dirty Rooms [G2#G3]'); // Pass
        this.modelValidator.validateGoalTextProperty('G1: Clean All Dirty Rooms[G2;G3]'); // Pass
        this.modelValidator.validateGoalTextProperty('G1: Clean All Dirty Rooms [FALLBACK(G1)]'); // Pass
        this.modelValidator.validateGoalTextProperty('G1: Clean All Dirty Rooms [FALLBACK(G1,G2)]'); // Pass
        this.modelValidator.validateGoalTextProperty('G1:Clean All Dirty Rooms [G2;G3]'); // Pass
        // Estrutura errada
        // this.modelValidator.validateGoalTextProperty('G1: Clean All Dirty Rooms [G2;G3') // Error
        // this.modelValidator.validateGoalTextProperty('G1: Clean All Dirty Rooms [G2%G3]') // Error
        // this.modelValidator.validateGoalTextProperty('G1: Clean All Dirty Rooms [G2G3]') // Error
        // this.modelValidator.validateGoalTextProperty('G1: Clean All Dirty Rooms FALLBACK') // Error
        // this.modelValidator.validateGoalTextProperty('G1: Clean All Dirty Rooms [FALLBACK(G1,G2,)]') // Error
        //GoalType
        //Pass
        this.modelValidator.validateGoalType('Query'); // Pass
        this.modelValidator.validateGoalType('Achieve'); // Pass
        this.modelValidator.validateGoalType('Perform'); // Pass
        // //Error
        // this.modelValidator.validateGoalType('query') // Error
        // this.modelValidator.validateGoalType('achieve') // Error
        // this.modelValidator.validateGoalType('perform') // Error
        // this.modelValidator.validateGoalType('querye') // Error
        // this.modelValidator.validateGoalType('asda') // Error
        //validateNodeIsALeaf
        //Pass
        this.modelValidator.validateNodeIsALeaf([]);
        this.modelValidator.validateNodeIsNotALeaf([this.modelValidator.tree.root]);
        //Error
        // this.modelValidator.validateNodeIsALeaf([this.modelValidator.tree.root])
        // this.modelValidator.validateNodeIsNotALeaf([])
        //validate QueryGoal Node
        //Pass
        this.modelValidator.currentNodeRef.node = queryNode;
        queryNode.goalData.customProperties.QueriedProperty = 'world_db->select( r : Room | !r.is_clean && r.abc)';
        this.modelValidator.validateQueryGoalProperties(queryNode.goalData.customProperties);
        this.modelValidator.validateQueryGoalQueriedProperty(queryNode.goalData.customProperties, {});
        queryNode.goalData.customProperties.QueriedProperty = 'world_db->select( r : Room | !r.is_clean && r.abc)';
        this.modelValidator.validateQueryGoalQueriedProperty(queryNode.goalData.customProperties, {});
        queryNode.goalData.customProperties.QueriedProperty = 'world_db->select(r:Room | !r.is_clean)';
        this.modelValidator.validateQueryGoalQueriedProperty(queryNode.goalData.customProperties, {});
        queryNode.goalData.customProperties.QueriedProperty = 'world_db->select(r:Room | !r.is_clean <> "teste")';
        this.modelValidator.validateQueryGoalQueriedProperty(queryNode.goalData.customProperties, {});
        //validate AchieveGoal Node
        //Pass
        this.modelValidator.currentNodeRef.node = achieveNode;
        achieveNode.goalData.customProperties.AchieveCondition = 'rooms->forAll(current_room | current_room.is_clean && current_room.abc)';
        this.modelValidator.validateAchieveGoalProperties(achieveNode.goalData.customProperties);
        this.modelValidator.validateAchieveGoalAchieveCondition(achieveNode.goalData.customProperties, { rooms: 'Sequence(Room)' });
        achieveNode.goalData.customProperties.AchieveCondition = 'current_room.is_clean >= 1';
        this.modelValidator.validateAchieveGoalAchieveCondition(achieveNode.goalData.customProperties, { rooms: 'Sequence(Room)' });
        achieveNode.goalData.customProperties.AchieveCondition = 'current_room.is_clean';
        this.modelValidator.validateAchieveGoalAchieveCondition(achieveNode.goalData.customProperties, { rooms: 'Sequence(Room)' });
        this.modelValidator.validateMonitorsProperty(achieveNode.goalData.customProperties.Monitors, { rooms: 'Sequence(Room)', rooms2: 'Sequence(Room)' });
        // Error
        // achieveNode.goalData.customProperties.AchieveCondition = 'rooms->forAll(current_room | current_room.is_clean %% r.is_clean)'
        // achieveNode.goalData.customProperties.AchieveCondition = 'rooms->forAll(current_room | current_room.is_clean <= a)'
        // achieveNode.goalData.customProperties.AchieveCondition = 'rooms->forAll(current_room | current_room.is_clean + a)'
        this.modelValidator.validateAchieveGoalAchieveCondition(achieveNode.goalData.customProperties, { rooms: 'Sequence(Room)' });
        // Error
        // achieveNode.goalData.customProperties.AchieveCondition = 'rooms->forAll(current_room | current_room.is_clean && current_room.abc)'
        // this.modelValidator.validateAchieveGoalAchieveCondition(achieveNode.goalData.customProperties, {})
        // Error
        // achieveNode.goalData.customProperties.Monitors = 'rooms , rooms2 : SAequence(Room)'
        // achieveNode.goalData.customProperties.Monitors = 'ro%$ms , rooms2 : Sequence(Room)'
        // this.modelValidator.validateMonitorsProperty(achieveNode.goalData.customProperties.Monitors, { rooms: 'Sequence(Room)', rooms2: 'Sequence(Room)' })
        // ==================================================
        console.log(`Total de errors: ${ErroLogger_1.ErrorLogger.errorCount}`);
    }
}
exports.ModelRulesValidatorTest = ModelRulesValidatorTest;

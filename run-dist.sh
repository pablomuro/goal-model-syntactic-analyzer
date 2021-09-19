#!/bin/sh


# Room Cleaning Exampl - JSON

./dist/goal-model-syntactic-analyzer "./goal-model-examples/Room Cleaning Example/hddl/Room Cleaning.hddl"\
 "./goal-model-examples/Room Cleaning Example/gm/Room Cleaning.txt"\
 "./goal-model-examples/Room Cleaning Example/configs/Room Cleaning Config.json"

# Exemplo Object Pickin - XML

./dist/goal-model-syntactic-analyzer "./goal-model-examples/Exemplo Object Picking/Object Picking.hddl"\
 "./goal-model-examples/Exemplo Object Picking/Object Picking.txt"\
 "./goal-model-examples/Exemplo Object Picking/configuration.xml"


# Exemplo Object Pickin - JSON

./dist/goal-model-syntactic-analyzer "./goal-model-examples/Exemplo Object Picking/Object Picking.hddl"\
 "./goal-model-examples/Exemplo Object Picking/Object Picking.txt"\
 "./goal-model-examples/Exemplo Object Picking/configuration.json"
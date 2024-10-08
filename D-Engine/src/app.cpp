#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include<iostream>
#include"Renderer/shader.h"
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>



int main()
{
    // Window creation ------------------
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_TRANSPARENT_FRAMEBUFFER, GL_TRUE);



    GLFWwindow* window = glfwCreateWindow(800, 600, "PainEngine", NULL, NULL);
    if (window == NULL)
    {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);


    //--------------------------------


    // Glad load opengl functions ------
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
    {
        std::cout << "Failed to initialize GLAD" << std::endl;
        return -1;
    }
    //---------------------------------


    // Main Loop --------------------------

    while (!glfwWindowShouldClose(window))
    {
        

        glClearColor(0.0f, 0.0f, 0.0f, 1.0f);

        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

      


        glfwPollEvents();
        glfwSwapBuffers(window);


    }
    //---------------------------------------


    glfwTerminate();
    return 0;
}








#include <stdio.h>
void printarray(int arr[], int n);
void quickSort(int arr[], int low, int high);
int partition(int arr[], int low, int high);
int main() {
    int arr[] = {2, 6, 9, 8, 2, 5, 45};
    int n = 7;
    printf("Sorted array: \n");
    quickSort(arr, 0, n - 1);
    printarray(arr, n);
    return 0;
}

void printarray(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int partition_index = partition(arr, low, high);
        quickSort(arr, low, partition_index - 1);
        quickSort(arr, partition_index + 1, high);
    }
}

int partition(int arr[], int low, int high) {
    int pivot = arr[low];
    int i = low - 1;
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;

    return (i + 1);
}

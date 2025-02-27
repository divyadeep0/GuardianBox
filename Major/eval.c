#include<stdio.h>
int main(){
    int arr[] = {12,20,34,54,64,79,80,91};
    int size = sizeof(arr) / sizeof(int);
    int low,high;
    low = 0;
    high = size-1;
    int element = 34;
    int index = binarySearch(arr, low, high, element);
    printf("Element found at index %d\n", element);
    return 0;
}
int binarySearch(int arr[], int low, int high, int element)
{
    int mid;
    if (low==high) {
        if(arr[low]==element)
            return low;
        else
            return -1;
    }
    else{
        mid = (low+high)/2;
        if(arr[mid]==element)
            return mid;
        else if(arr[mid]<element)
             binarySearch(arr,mid+1,high,element);
        else
            return binarySearch(arr,low,mid-1,element);
    }
}
